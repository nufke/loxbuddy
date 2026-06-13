import { Invitation, Inviter, RegistererState, Registerer, SessionState, UserAgent } from 'sip.js';
import type { Session, UserAgentOptions } from 'sip.js';

import { appStore } from '$lib/stores/LbAppStore.svelte';

export type SipCallState = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended';

/**
 * Class implementing a SIP client for intercoms (if any)
 * It handles registration, incoming and outgoing audio/video calls.
 */
export class SipClient {
	private userAgent: UserAgent | null = null;
	private registerer: Registerer | null = null;
	private session: Session | null = null;
	private remoteMedia: HTMLVideoElement | HTMLAudioElement | null = null;
	private localMedia: HTMLVideoElement | null = null;
	private audioCtx: AudioContext | null = null;
	private beepInterval: ReturnType<typeof setInterval> | undefined;
	private beepOsc: OscillatorNode | null = null;
	private callTimeout: ReturnType<typeof setTimeout> | undefined;

	/**
	 * Called whenever the call state transitions. Override to react to state changes in the UI.
	 * @param state The new {@link SipCallState} value.
	 */
	onCallState: (state: SipCallState) => void = (state) => {
		appStore.callStatus = String(state);
		console.info(`[SipClient] Call state: ${state}`);
	}

	/**
	 * Called when an incoming invitation arrives. Override to present an incoming-call UI.
	 * @param invitation The sip.js {@link Invitation} for the incoming call.
	 */
	onIncomingCall: (invitation: Invitation) => void = (invitation) => {
		console.info(`[SipClient] Incoming call from: ${invitation.remoteIdentity.uri}`);
	}

	/**
	 * Called when the SIP registration state changes. Override to update UI indicators.
	 * @param registered `true` when successfully registered, `false` when unregistered.
	 */
	onRegistrationState: (registered: boolean) => void = (registered) => {
		appStore.sipStatus = registered ? 1 : 0;
		console.info(`[SipClient] Registration: ${registered ? 'registered' : 'unregistered'}`);
	};

	constructor() {}

	/**
	 * Connects to the SIP WebSocket server and registers the user agent.
	 * If arguments are omitted, credentials are read from {@link appStore.sipCredentials}.
	 * @param wsServer (optional) WebSocket SIP server URL, e.g. wss://sip.example.com:8081
	 * @param userName (optional) SIP username (caller)
	 * @param domainName (optional) SIP domain, e.g. sip.example.com
	 * @param password (optional) SIP password
	 * @returns A promise that resolves once registration is sent.
	 */
	async register(wsServer?: string, userName?: string, domainName?: string, password?: string): Promise<void> {
		const cred = appStore.sipCredentials;
		wsServer = wsServer ?? cred?.wsServer ?? '';
		domainName = domainName ?? cred?.domainName ?? '';
		userName = userName ?? cred?.userName ?? '';
		password = password ?? cred?.password ?? '';
		if (!wsServer.length || !domainName.length || !userName.length || !password.length) {
			console.error('[SipClient] Incomplete SIP credentials configured');
			return;
		}
		const caller = `sip:${userName}@${domainName}`;

		const uri = UserAgent.makeURI(caller);
		if (!uri) throw new Error(`[SipClient] Invalid caller URI: ${caller}`);

		const options: UserAgentOptions = {
			uri,
			transportOptions: { server: wsServer },
			authorizationUsername: userName,
			authorizationPassword: password,
			displayName: 'Anonymous',
			delegate: {
				onInvite: (invitation: Invitation) => this.handleIncomingCall(invitation)
			},
			logLevel: 'error'
		};

		this.userAgent = new UserAgent(options);
		await this.userAgent.start();

		this.registerer = new Registerer(this.userAgent);
		this.registerer.stateChange.addListener((state: RegistererState) => {
			const registered = state === RegistererState.Registered;
			if (registered) console.info(`[SipClient] Registered ${caller}`);
			this.onRegistrationState(registered);
		});

		await this.registerer.register();
		this.onCallState?.('idle');
	}

	/**
	 * Initiates an outgoing SIP call (RFC 3323).
	 * @param target Full SIP URI of the callee, e.g. sip:intercom@192.168.1.100
	 * @param withVideo Whether to include a video track. Defaults to true.
	 * @returns A promise that resolves once the invite has been sent.
	 */
	async call(target: string, withVideo = true): Promise<void> {
		if (!this.userAgent) throw new Error('[SipClient] SIP client not registered');
		if (this.session && this.session.state !== SessionState.Terminated)
			throw new Error('[SipClient] A session is already active — hang up before starting a new call');
		const calleeUri = UserAgent.makeURI(target);
		if (!calleeUri) {
			throw new Error(`[SipClient] Invalid callee URI: ${target}`);
		}

		const inviter = new Inviter(this.userAgent, calleeUri, {
			extraHeaders: ['Privacy: id'],
			sessionDescriptionHandlerOptions: {
				constraints: { audio: true, video: withVideo }
			}
		});
		this.session = inviter;
		this.setupSessionListeners(inviter);
		this.onCallState?.('calling');
		this.playBeep();
		this.beepInterval = setInterval(() => this.playBeep(), 3300);
		this.callTimeout = setTimeout(() => {
			console.warn('[SipClient] Call timeout — no connection after 10 s');
			this.hangup();
		}, 10000);
		await inviter.invite();
	}

	/**
	 * Accepts the current incoming call.
	 * No-op if there is no pending incoming invitation.
	 * @param withVideo Whether to include a video track in the answer. Defaults to true.
	 * @returns A promise that resolves once the 200 OK has been sent.
	 */
	async answer(withVideo = true): Promise<void> {
		if (!(this.session instanceof Invitation)) return;
		await this.session.accept({
			sessionDescriptionHandlerOptions: {
				constraints: { audio: true, video: withVideo }
			}
		});
	}

	/**
	 * Rejects the current incoming call with a 486 Busy Here response.
	 * No-op if there is no pending incoming invitation.
	 * @returns A promise that resolves once the rejection has been sent.
	 */
	async reject(): Promise<void> {
		if (!(this.session instanceof Invitation)) return;
		await this.session.reject();
		this.session = null;
	}

	/**
	 * Ends or cancels the current session regardless of its state.
	 * Sends cancel() for an establishing call, and bye() for an established call,
	 * or 486 for an unanswered incoming call. No-op if there is no active session.
	 * @returns A promise that resolves once the termination message has been sent.
	 */
	async hangup(): Promise<void> {
		if (!this.session) return;
		const s = this.session;
		switch (s.state) {
			case SessionState.Initial:
			case SessionState.Establishing:
				if (s instanceof Inviter) {
					// sip.js may throw if the peer connection closes before SDP negotiation
					// completes — the CANCEL is still sent, so swallow the error
					try { await s.cancel(); } catch (e) { console.warn('[SipClient] cancel() failed during establishment:', e); }
				} else if (s instanceof Invitation) {
					await s.reject();
				}
				break;
			case SessionState.Established:
				await s.bye();
				break;
		}
		this.stopBeep(); // stop sound if any
		this.session = null;
	}

	/**
	 * Hangs up any active session, unregisters from the SIP server and stops the user agent.
	 * The instance can be re-used by calling {@link register} again.
	 * @returns A promise that resolves once the user agent has fully stopped.
	 */
	async unregister(): Promise<void> {
		await this.hangup();
		await this.registerer?.unregister();
		await this.userAgent?.stop();
		this.registerer = null;
		this.userAgent = null;
	}

	/**
	 * Binds an HTML media element to receive the remote audio/video stream.
	 * The element's  source object is set automatically when a call is established
	 * and cleared when the call ends.
	 * @param element - A video or audio element for remote playback.
	 */
	setRemoteMedia(element: HTMLVideoElement | HTMLAudioElement): void {
		this.remoteMedia = element;
	}

	/**
	 * Binds a video element to display the local camera preview.
	 * The element's source object is set automatically when a call is established
	 * and cleared when the call ends.
	 * @param videoElement A video element for local camera preview.
	 */
	setLocalMedia(videoElement: HTMLVideoElement): void {
		this.localMedia = videoElement;
	}

	/**
	 * Whether the user agent is currently registered with the SIP server.
	 * @returns true if registered, and false otherwise.
	 */
	get isRegistered(): boolean {
		return this.registerer?.state === RegistererState.Registered;
	}

	/**
	 * The current call state derived from the active session.
	 * @returns One of idle,  calling, ringing, connected, or ended state
	 */
	get callState(): SipCallState {
		if (!this.session) return 'idle';
		switch (this.session.state) {
			case SessionState.Initial:
			case SessionState.Establishing:
				return this.session instanceof Inviter ? 'calling' : 'ringing';
			case SessionState.Established:
				return 'connected';
			default:
				return 'idle';
		}
	}

	/**
	 * Helper method to play a sine-wave tone fade-in and fade-out to avoid clicks.
	 * Uses the shared {@link audioCtx} to avoid initialisation latency between calls.
	 * @param frequency Frequency of the tone in Hz.
	 * @param duration Duration of the tone in seconds.
	 * @param volume Peak gain level (0–1). Defaults to 0.2.
	 * @returns The started {@link OscillatorNode} so the caller can stop it early if needed.
	 */
	private beep(frequency: number, duration: number, volume = 0.2): OscillatorNode {
		this.audioCtx ??= new AudioContext();
		const ctx = this.audioCtx;
		const t = ctx.currentTime + 0.05;
		const gain = ctx.createGain();
		gain.connect(ctx.destination);
		gain.gain.setValueAtTime(0, t);
		gain.gain.linearRampToValueAtTime(volume, t + 0.01);
		gain.gain.setValueAtTime(volume, t + duration - 0.01);
		gain.gain.linearRampToValueAtTime(0, t + duration);
		const osc = ctx.createOscillator();
		osc.connect(gain);
		osc.type = 'sine';
		osc.frequency.value = frequency;
		osc.start(t);
		osc.stop(t + duration);
		return osc;
	}

	/**
	 * Plays a single 440 Hz waiting tone burst via {@link beep} and stores the oscillator
	 * in {@link beepOsc} so it can be stopped early by {@link stopBeep}.
	 */
	private playBeep(): void {
		this.beepOsc = this.beep(440, 1.2);
	}

	/**
	 * Plays a bell-like ping when the connection is established and video starts playing.
	 * Used by {@link stopBeep} to signal that the connection has been established.
	 * @param frequency Frequency of the tone in Hz. Defaults to 800 Hz.
	 * @param duration Total decay duration in seconds. Defaults to 0.6 s.
	 * @param volume Initial peak gain (0–1). Defaults to 0.18.
	 */
	private ping(frequency = 800, duration = 0.6, volume = 0.18): void {
		this.audioCtx ??= new AudioContext();
		const ctx = this.audioCtx;
		const t = ctx.currentTime + 0.05;
		const gain = ctx.createGain();
		gain.connect(ctx.destination);
		gain.gain.setValueAtTime(volume, t);
		gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
		const osc = ctx.createOscillator();
		osc.connect(gain);
		osc.type = 'sine';
		osc.frequency.value = frequency;
		osc.start(t);
		osc.stop(t + duration);
	}

	/**
	 * Clears the repeating beep interval started by {@link call} and immediately stops
	 * any currently playing oscillator. Optionally plays a {@link ping} to confirm connection.
	 * @param ping When true, plays a confirmation ping after stopping the beep. Defaults to false.
	 */
	private stopBeep(ping: boolean = false): void {
		clearInterval(this.beepInterval);
		this.beepInterval = undefined;
		try { this.beepOsc?.stop(); } catch { /* already stopped */ }
		this.beepOsc = null;
		if (ping) this.ping();
	}

	/**
	 * Handles a new incoming invitation from the user agent delegate.
	 * @param invitation The incoming invitation session provided by sip.js.
	 */
	private handleIncomingCall(invitation: Invitation): void {
		this.session = invitation;
		this.setupSessionListeners(invitation);
		this.onIncomingCall?.(invitation);
		this.onCallState?.('ringing');
	}

	/**
	 * Attaches listeners to a session to drive media attachment
	 * and the public {@link onCallState} callback.
	 * @param session The sip.js session to observe.
	 */
	private setupSessionListeners(session: Session): void {
		session.stateChange.addListener((state: SessionState) => {
			switch (state) {
				case SessionState.Established:
					clearTimeout(this.callTimeout);
					this.callTimeout = undefined;
					this.attachMedia(session);
					this.onCallState?.('connected');
					break;
				case SessionState.Terminated:
					clearTimeout(this.callTimeout);
					this.callTimeout = undefined;
					this.detachMedia();
					this.onCallState?.('ended');
					if (this.session === session) this.session = null;
					break;
			}
		});
	}

	/**
	 * Wires the local and remote media streams from the session description handler
	 * to the bound HTML media elements.
	 * @param session The established sip.js session whose streams to attach.
	 */
	private attachMedia(session: Session): void {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const pc = (session.sessionDescriptionHandler as any)?.peerConnection as RTCPeerConnection | undefined;
		if (!pc) { this.stopBeep(); return; }

		if (this.remoteMedia) {
			const remoteStream = new MediaStream(pc.getReceivers().map(r => r.track).filter(Boolean) as MediaStreamTrack[]);
			pc.addEventListener('track', (e: RTCTrackEvent) => remoteStream.addTrack(e.track));
			this.remoteMedia.srcObject = remoteStream;
			this.remoteMedia.play()
				.then(() => this.stopBeep(true))
				.catch((e) => { console.warn('[SipClient] remoteMedia play failed:', e); this.stopBeep(); });
		} else {
			this.stopBeep();
		}
		if (this.localMedia) {
			const localStream = new MediaStream(pc.getSenders().map(s => s.track).filter(Boolean) as MediaStreamTrack[]);
		console.log('localStream', localStream)
			this.localMedia.srcObject = localStream;
			this.localMedia.play().catch((e) => console.warn('[SipClient] localMedia play failed:', e));
		}
	}

	/**
	 * Clears objects on media elements when the call ends.
	 */
	private detachMedia(): void {
		if (this.remoteMedia) this.remoteMedia.srcObject = null;
		if (this.localMedia) this.localMedia.srcObject = null;
	}
}

export const sipClient = new SipClient();
