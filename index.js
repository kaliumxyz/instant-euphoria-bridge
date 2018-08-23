const { Bot } = require('euphoria.js')
const InstantConnection = require('instant-connection')
const commandLineArgs = require('command-line-args')

// const credentials = require('credentials.json')

const room = 'test';

const optionDefinitions = [
  { name: 'verbose', alias: 'v', type: Boolean },
  { name: 'room', alias: 'r', type: String },
  { name: 'instant_room', alias: 'i', type: String },
  { name: 'euphoria_room', alias: 'e', type: String },
  { name: 'logging', alias: 'l', type: Boolean }
]

const options = commandLineArgs(optionDefinitions)

const euphoria = new Bot('instant', options.euphoria_room || options.room || room);
const instantConnection = new InstantConnection(options.instant_room || options.room || room);

euphoria.once('ready', () => 
		console.log(euphoria.identity)
	);

instantConnection.once('ready',  () => 
	instantConnection.nick('euphoria')
)

let flag = false;

const euphQueue = [];
const instQueue = [];

if (options.logging) {
	euphoria.connection.on('message', console.log)
	instantConnection.on('broadcast', console.log)
}
euphoria.on('send-event', raw => {
	euphQueue.push()
	if(!flag) {
		const data = raw.data;
		console.log(data);
		instantConnection.postAs(data.content, null, data.sender.name);
		instantConnection.nick('euphoria')
		flag = true;
		return;
	}
	flag = false;
})
instantConnection.on('broadcast', raw => {
	const data = raw.data;
	euphQueue.push()
	if(data.type === 'post') {
		console.log(data)
		if(!flag) {
			let nick = euphoria.nick;
			euphoria.nick = data.nick;
			euphoria.once('nick-set', () => {
				euphoria.send(data.text)
				euphoria.nick = nick;
			})
			flag = true;
			return;
		}
		flag = false;
	}
})

