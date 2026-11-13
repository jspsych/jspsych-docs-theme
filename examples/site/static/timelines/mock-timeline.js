/**
 * Tiny stand-in for a jspsych-timelines package bundle, used by the
 * TimelineExample demo page to exercise widgets the flanker package doesn't
 * use. Requires jsPsych core + @jspsych/plugin-html-button-response.
 * Exposes `jsPsychTimelineMock.createTimeline(jsPsych, options)`.
 */
var jsPsychTimelineMock = (function () {
  function pick(v) {
    if (v && typeof v === 'object') {
      var step = v.step || 1;
      var n = Math.floor((v.max - v.min) / step);
      return v.min + step * Math.floor(Math.random() * (n + 1));
    }
    return v;
  }
  function createTimeline(jsPsych, options) {
    options = options || {};
    var nPractice = 2;
    var nTest = typeof options.n_trials === 'number' ? options.n_trials : 3;
    var trials = [];
    var intro = {
      type: jsPsychHtmlButtonResponse,
      stimulus:
        '<p>Mock task. Options received by <code>createTimeline</code>:</p>' +
        '<pre style="text-align:left;font-size:12px;max-height:240px;overflow:auto">' +
        JSON.stringify(options, null, 2).replace(/</g, '&lt;') +
        '</pre>',
      choices: ['Start'],
      data: {phase: 'intro'},
    };
    function trial(phase, i) {
      var eff = Object.assign({}, options, phase === 'practice' ? options.practice || {} : {});
      var iti = pick(eff.iti_ms === undefined ? 500 : eff.iti_ms);
      return {
        type: jsPsychHtmlButtonResponse,
        stimulus: '<p>' + phase + ' trial ' + (i + 1) + ' (feedback: ' + (eff.trial_feedback || 'none') + ')</p>',
        choices: ['Congruent', 'Incongruent'],
        trial_duration: eff.response_window_ms === null ? null : eff.response_window_ms === undefined ? 1500 : eff.response_window_ms,
        post_trial_gap: iti,
        data: {phase: phase, trial: i + 1, iti_used: iti, adaptive: eff.adaptive || null},
      };
    }
    trials.push(intro);
    for (var i = 0; i < nPractice; i++) trials.push(trial('practice', i));
    for (var j = 0; j < nTest; j++) trials.push(trial('test', j));
    return {timeline: trials};
  }
  return {createTimeline: createTimeline};
})();
