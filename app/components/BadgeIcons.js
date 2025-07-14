const template = `
	<div>
		<div v-for="x in badges">
			<div v-if="mapper.properties.player.badges[x].value == true && g3stateVariable != 'Base Stats'">
				<img class="badge" :src="'images/badges/positioned/'+this.game.region+'/'+x+'.png'"/>
			</div>
		</div>
	</div> 
`;

module.exports = {
    template,
    props: ["mapper", "game"],
	data () {
		return {
			badges: ["badge1", "badge2", "badge3", "badge4", "badge5", "badge6", "badge7", "badge8"],
		}
	},
}
