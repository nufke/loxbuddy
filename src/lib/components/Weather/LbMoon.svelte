<script lang="ts">
	let { phase } = $props();
	let h = 10;

	let phaseRight = $state(0);
	let phaseScale = $state(1);
	let phaseTrans = $state(0);

	$effect( () => {
		if(phase*2 <= 1) {
  	  phaseRight = (1-phase*2);
		}
		if(phase*2 >= 1) {
			phaseScale = (1-(phase*2-1));
			phaseTrans = (100/h)*phaseScale;
		}
	});
</script>

<div class="moon m-1 flex flex-row">
	<svg height={200/h} width={100/h} class="m-0 relative inline-block"><!--left-->
		<circle cx={100/h} cy={100/h} r={90/h} stroke="white" stroke-width="1.2" fill="black" />
		<circle cx={100/h} cy={100/h} r={90/h} stroke="white" stroke-width="1.2" fill="white" 
			style={'transform-origin: 0% 0%; transform: translate(' + phaseTrans + 'px,0) scaleX(' + (1 - phaseScale) + ')'}/>
	</svg>
	<svg height={200/h} width={100/h} class="moon-right m-0 relative inline-block"><!--right-->
		<circle cx="0" cy={100/h} r={90/h} stroke="white" stroke-width="1.2" fill="white"  />
		<circle cx="0" cy={100/h} r={90/h} stroke="white" stroke-width="1.2" fill="black" 
			style={'transform: scaleX(' + phaseRight + ')'} />
	</svg>
</div>
