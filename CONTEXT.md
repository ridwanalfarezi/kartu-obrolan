# Kartu Obrolan

Kartu Obrolan membantu kelompok teman memulai dan menjaga percakapan saat nongkrong melalui pertanyaan yang dibuat AI.

## Participants and sessions

**Hangout group**:
Two or more friends using the app together during a casual gathering.
_Avoid_: audience, customer segment

**Conversation session**:
A temporary activity in which one hangout group receives and discusses a package of generated questions.
_Avoid_: account, room, meeting

**Player count**:
The exact number of people in the hangout group for the current conversation session, selected before generation and kept for the session. Supported values are 2–12.
_Avoid_: audience size, room capacity

**Question package**:
A set of 10 questions generated for one conversation session from the selected player count, category, and depth.
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

## Question novelty

**Question variation history**:
Up to 200 accepted questions remembered on the user's device for 30 days so future conversation sessions can avoid exact repeats and close paraphrases. The history is sent only with a generation request and is never retained as server-side history.
_Avoid_: saved session, conversation history, server memory

**Reset question variation**:
A user action that removes question variation history from the current device without changing analytics or the active conversation session.
_Avoid_: reset session, clear analytics

## Analytics

**Session analytics**:
Anonymous, device-local counters recorded in localStorage. Tracks session count, selected category and depth, skip count, and regenerate count. Analytics never stores question text, personal identifiers, or free-form input; question variation history is a separate device-local feature.
_Avoid_: telemetry, tracking

Analytics can be disabled without changing the core conversation flow.
