# Kartu Obrolan

Kartu Obrolan membantu kelompok teman memulai dan menjaga percakapan saat nongkrong melalui pertanyaan yang dibuat AI.

## Participants and sessions

**Hangout group**:
A group of 3–8 friends using the app together during a casual gathering.
_Avoid_: audience, customer segment

**Conversation session**:
A temporary activity in which one hangout group receives and discusses a package of generated questions.
_Avoid_: account, room, meeting

**Question package**:
A set of 10 questions generated for one conversation session from the selected category and depth.
_Avoid_: deck, playlist, batch

**Question card**:
One question from the question package currently shown to the hangout group.
_Avoid_: prompt, message, post

## Question shaping

**Category**:
The broad conversational direction selected before a conversation session, such as light, funny, experience-based, reflective, or mixed.
_Avoid_: tag, topic filter

**Depth**:
The intended level of personal or emotional disclosure for questions in a conversation session: casual, personal, or deep.
_Avoid_: difficulty, intensity

**Explorative mode**:
The product mode that allows adult, sensitive, or controversial topics when they are relevant to the selected category and depth.
_Avoid_: unfiltered mode, unsafe mode

## Question actions

**Skip**:
A participant action that removes the current question card from the active flow without answering it.
_Avoid_: delete, reject

**Regenerate**:
A participant action that asks the AI for a replacement for the current question card.
_Avoid_: refresh, retry

**Retry**:
An action used when AI generation fails and the app needs to request the intended question package or replacement again.
_Avoid_: regenerate

## Analytics

**Session analytics**:
Anonymous, device-local counters recorded in localStorage. Tracks session count, selected category and depth, skip count, and regenerate count. No question text, personal identifiers, or free-form input is ever stored.
_Avoid_: telemetry, tracking

Analytics can be disabled without changing the core conversation flow.
