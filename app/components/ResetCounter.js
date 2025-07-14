const template = `
	<div>
		{{ui_saturation}}
		<div 
			class="colored-image ds" 
			:style="'filter: saturate('+ui_saturation+') drop-shadow(0px 0px 1px #000000)'" 
			style="--url: url(images/ui/resets.svg)"
		></div>
		<div v-if="blackouts === 0" class="resetsTitle">
			resets
		</div>
		<div v-else-if="blackouts > 0 && resets === 0" class="blackoutsTitle">
			blackouts
		</div>
		<div v-else-if="blackouts > 0 && resets > 0"  class="resetsTitle">
			faults
		</div>
		<div v-show="display == true" id="reset_counter" class="resets">
			<div :style="{ 'font-size': fontSize + 'px'}">
				{{faults}}
			</div>
		</div>
	</div>
`;

module.exports = {
    template,
    props: ["display", "resets", "blackouts", "ui_saturation"],
	computed: {
		faults() {
			return this.resets + this.blackouts || 0;
		},
		fontSize() {
			var faultDisplayLength = this.faults.toString().length;
			if (faultDisplayLength > 3) {
				return 38
			}
			if (faultDisplayLength > 2) {
				return 48
			}
			return 48; // >= 3 digits.
		}
	}
}
