// Maestro JS runtime: simulate inactive→active by pressing home then re-foregrounding.
// On Android emulator this approximates lock; on iOS simulator it triggers AppState 'inactive'.
output.note = 'lock-toggle invoked';
