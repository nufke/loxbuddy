<script lang="ts">

	let { phase } = $props();

	let phaseRight = $state(0);//  $derived( () => (phase <= 100) ? 1 - phase / 100 : 0);
	let phaseScale = $state(1);//$derived( () => (phase >= 100) ? 1 - (phase - 100) / 100 : 1);
	let phaseTrans = $state(100); //  $derived( () => (phase >= 100) ? 100 * phaseScale : 100);

	let h = 8;

	if(phase*200 <= 100) {
    phaseRight = (1-phase*200/100);
  } 

  if(phase*200 >= 100) {
    phaseScale = (1-(phase*200-100)/100);
    phaseTrans = 100*phaseScale;
  }
</script>

<div class="moon m-1 flex flex-row" style="width: {200/h}px">
	<svg height={200/h} width={100/h} class="w-[100px] m-0 relative inline-block"><!--left-->
		<circle cx={100/h} cy={100/h} r={90/h} stroke="white" stroke-width="1" fill="black" />
		<circle cx={100/h} cy={100/h} r={90/h} stroke="white" stroke-width="1" fill="white" 
			style={'transform-origin: 0% 0%; transform: translate(' + phaseTrans + 'px,0) scaleX(' + (1 - phaseScale) + ')'}/>
	</svg>
	<svg height={200/h} width={100/h} class="moon-right w-[100px] m-0 relative inline-block"><!--right-->
		<circle cx="0" cy={100/h} r={90/h} stroke="white" stroke-width="1" fill="white"  />
		<circle cx="0" cy={100/h} r={90/h} stroke="white" stroke-width="1" fill="black" 
			style={'transform: scaleX(' + phaseRight + ')'} />
	</svg>
</div>
