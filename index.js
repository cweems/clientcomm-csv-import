/* Usage:
	node index.js [auth_token] [front_inbox_id] [user_email]
	example: node index.js abc123jhkl 12345 john@workforce.org
*/

'use strict';

const
	fs = require('fs'),
	request = require('request'),

	authToken = process.argv[2],
	inboxID = process.argv[3],
	userEmail = process.argv[4],
	messageFilename = userEmail + ' - messages.txt',
	contactsFilename = userEmail + ' - contacts.txt',

	// Store contacts as sets
	// so we can check for dublicates
	contacts = new Set(),
	no_contact = new Set(),

	authHeaders = {
		'Authorization': 'Bearer ' + authToken,
		'Accept': 'application/json'
	},

	getInboxRequest = {
		url: 'https://api2.frontapp.com/inboxes/' + inboxID + '/conversations?limit=100',
		headers: authHeaders
	};

// Handle case where a contact has not been created,
// but the conversation still has a phone number.
function nullContact(phoneNumber) {
	if(!no_contact.has(phoneNumber)) {
		no_contact.add(phoneNumber);
		var line = "\nNone," + phoneNumber + "," + phoneNumber
		fs.appendFileSync(contactsFilename, line)
	}
}

function printContact(err, response, body) {
	if(err) throw err;
	const
		parsedBody = JSON.parse(body),
		phone_number = parsedBody['handles'][0]['handle'],
		name = parsedBody['name'] || '',
		first_name = name.split(' ')[0] || 'None',
		last_name = name.split(' ')[1] || phone_number,
		line = '\n' + first_name + "," + last_name + "," + phone_number;

	fs.appendFileSync(contactsFilename, line)
}

function getContact(url) {
	if(!contacts.has(url) && url !== null) {
		contacts.add(url);
		let contactRequext = {
			url: url,
			headers: authHeaders
		}
		request(contactRequext, printContact)
	}
}

function printMessage(err, response, body) {
	if(err) throw err;

	let
		parsedBody = JSON.parse(body),
		messages = parsedBody._results;

	// Loop through messages in converation
	for(var i = 0; i < messages.length; i++) {
		let
			rawMessageText = messages[i]['text'],
			cleanedText = rawMessageText.replace(/\n|\r|\|/g, " ").replace(/"/g, "'"),
			createdAt = messages[i]['created_at'],
			inbound = messages[i]['is_inbound'],
			recipients = messages[i]['recipients'],
			clientPhone,
			line;

		// Loop through recipients of message
		for(var j = 0; j < recipients.length; j++) {
			// If the recipient's role is from, and the message is inbound
			if(recipients[j]['role'] === 'from' && inbound == true) {
					// they are a client
					clientPhone = recipients[j]['handle'];

					// Get the link to the contact resource
					let contactLink = recipients[j]['_links']['related']['contact']

					// Check if the contact resource is null
					contactLink === null ? nullContact(recipients[j]['handle']) : getContact(contactLink)

			} else if (recipients[j]['role'] === 'to' && inbound == false) {
					// If a recipient's role is to and the message is outbound
					// they are also a client
					clientPhone = recipients[j]['handle']

					let contactLink = recipients[j]['_links']['related']['contact']

					contactLink === null ? nullContact(recipients[j]['handle']) : getContact(contactLink)
			}
		}

		line = '\n' + cleanedText + "|" + inbound + "|" + clientPhone + "|" + createdAt;
		fs.appendFileSync(messageFilename, line)
	}
}

// Get conversation info
function getConversation(array) {

	for(var i = 0; i < array.length; i ++) {
		var requestOptions = {
			url: array[i] + '?limit=100',
			headers: authHeaders
		}
		request(requestOptions, printMessage)
	}
}

// Get conversations from inbox
function listConversationsFromInbox(err, response, body) {
	if(err) throw err;

	var conversations = [];
	var parsedBody = JSON.parse(body);
	var results = parsedBody._results;

	// Extract conversations from results
	for(var result in results) {
		conversations.push(results[result]['_links']['related']['messages'])
	}

	// Pass array of conversations to getConversation
	getConversation(conversations)
}

// Clear output file before running
fs.writeFile(messageFilename, '', () => {console.log('=== Clearing Messages File ===')})
fs.writeFile(contactsFilename, '', () => {console.log('=== Clearing Contacts File ===')})

// Write headers
fs.appendFileSync(messageFilename, 'body|inbound|client_number|created_at')
fs.appendFileSync(contactsFilename, 'first_name,last_name,phone_number')

// Make initial request to get conversation in inbox
request(getInboxRequest, listConversationsFromInbox);
