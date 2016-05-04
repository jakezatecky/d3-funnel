class Navigator {

	/**
	 * Given a list of path commands, returns the compiled description.
	 *
	 * @param {Array} commands
	 *
	 * @returns {string}
	 */
	plot(commands) {
		let path = '';

		commands.forEach((command) => {
			path += `${command[0]}${command[1]},${command[2]} `;
		});

		return path.replace(/ +/g, ' ').trim();
	}

}

export default Navigator;
