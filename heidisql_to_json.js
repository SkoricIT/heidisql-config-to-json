const fs = require('fs');
const path = require('path');

// Adapted from Code by Chase Woodford
// Source: http://www.chasewoodford.com/blog/how-to-recover-a-stored-password-from-heidisql/
function heidiDecode(hex) {
	let str = '';
	const shift = parseInt(hex.substr(-1));
	hex = hex.substr(0, hex.length - 1);
	for (let i = 0; i < hex.length; i += 2) str += String.fromCharCode(parseInt(hex.substr(i, 2), 16) - shift);
	return str;
}

const raw_data = fs.readFileSync(path.resolve(__dirname, 'export.txt'), { encoding: 'utf-8' });
const raw_lines = raw_data.split(/[\r\n]+/);
const server_lines = raw_lines.filter(x => x.startsWith('Servers'));

const servers = {};
for (const line of server_lines) {
	const config_path_parts = line.split('\\');
	for (const index of Object.keys(config_path_parts)) {
		const p = config_path_parts[index];

		// data payload detection is necessary because of variable config path lenghts
		if (p.includes('<|||>')) {
			const data_parts = p.split('<|||>');

			// only read interesting parts of the config
			for (const data_point of ['User', 'Password', 'Host', 'Port']) {
				if (data_parts[0] === data_point) {

					// initialize server path in result object
					if (!servers[config_path_parts[index - 1]]) {
						servers[config_path_parts[index - 1]] = {};
					}

					// decode password
					if (data_point === 'Password') {
						servers[config_path_parts[index - 1]][data_point] = heidiDecode(data_parts[2])
						continue;
					}

					// just write data
					servers[config_path_parts[index - 1]][data_point] = data_parts[2]

				}

			}

		}
	}
}
fs.writeFileSync(path.resolve(__dirname, 'servers.json'), JSON.stringify(servers));