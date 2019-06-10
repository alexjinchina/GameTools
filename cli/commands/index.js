export default function getCommands(config) {
	return [require("./sync")].map(({ command, describe, builder, handler }) => {
		return {
			command,
			describe,
			builder,
			handler: argv => handler(argv, config)
		};
	});
}
