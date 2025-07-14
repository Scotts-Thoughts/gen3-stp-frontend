const template = `
	<div v-if="display">
		<transition name="fadeBattle">
			<div v-show="gamestate == 'Overworld' && mapper.properties.overworld.repelCount?.value > 0">
				<div class="colored-image" :style="'filter: saturate('+ui_saturation+')'" style="--url: url(images/ui/accuracy.svg)"></div>
				<div class="accEvaStyle accEvaLabel accuracyLabel" style="font-size: 14px;">Repel Steps:</div>
				<div class="accEvaStyle accEvaMod accuracyMod">{{ mapper.properties.overworld.repelCount?.value }}</div>
			</div>
		</transition>
	</div>
`;

module.exports = {
    template,
	props: ["mapper", "gamestate", "display", "ui_saturation"],
}
