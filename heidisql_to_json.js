const fs = require('fs');
const path = require('path');

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
console.log(raw_lines.length);
const server_lines = raw_lines.filter(x => x.startsWith('Servers'));
console.log(server_lines.length);

const servers = {};
for (const l of server_lines) {
	const parts = l.split('\\');
	for (const index of Object.keys(parts)) {
		const p = parts[index];
		if (p.includes('<|||>')) {
			const data_parts = p.split('<|||>');
			for(const data_point of ['User', 'Password', 'Host', 'Port']){


				if (data_parts[0] === data_point) {
					if (!servers[parts[index - 1]]) {
						servers[parts[index - 1]] = {};
					}
					if(data_point === 'Password'){
						servers[parts[index - 1]][data_point] = heidiDecode(data_parts[2])
					} else {
						servers[parts[index - 1]][data_point] = data_parts[2]
					}
				}

			}

		}
	}
}
fs.writeFileSync(path.resolve(__dirname, 'servers.json'), JSON.stringify(servers));