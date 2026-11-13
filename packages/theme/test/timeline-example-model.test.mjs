// Run with `npm test` (builds lib/ first). Zero-dependency: node:test.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as m from '../lib/components/TimelineExample/model.js';

const schema = {
  title: 'FlankerOptions',
  type: 'object',
  properties: {
    response_window_ms: {
      type: ['number', 'null'], default: 1500, minimum: 0,
      'x-jspsych': {group: 'timing', unit: 'ms', absentValue: null, phaseOverridable: true},
    },
    iti_ms: {
      oneOf: [
        {type: 'number', minimum: 0},
        {type: 'object', properties: {min: {type: 'number'}, max: {type: 'number'}, step: {type: 'number'}}, required: ['min', 'max']},
      ],
      default: 500,
      'x-jspsych': {group: 'timing', unit: 'ms', widget: 'duration', absentValue: 0},
    },
    trial_feedback: {
      type: 'string', enum: ['none', 'accuracy', 'rt'], default: 'none',
      'x-jspsych': {group: 'feedback', absentValue: 'none', phaseOverridable: true},
    },
    condition_proportions: {
      type: 'object', additionalProperties: {type: 'number', minimum: 0, maximum: 1},
      default: {congruent: 0.5, incongruent: 0.5}, 'x-jspsych': {group: 'design', widget: 'map'},
    },
    adaptive: {
      type: ['object', 'null'], default: null,
      properties: {procedure: {type: 'string', enum: ['a', 'b']}, start_level: {type: 'number', default: 1}, step_size: {type: 'number'}},
      required: ['procedure'],
      'x-jspsych': {group: 'procedure', widget: 'bundle', absentValue: null},
    },
    tags: {type: 'array', items: {type: 'string'}, 'x-jspsych': {group: 'zzz_custom', advanced: true}},
    weird: {type: 'object', properties: {a: {type: 'number'}}},
    flag: {type: 'boolean', default: true},
  },
};
const fields = m.fieldsOf(schema);
const f = (n) => fields.find((x) => x.name === n);

test('classify maps schema shapes to widgets', () => {
  assert.equal(f('response_window_ms').kind, 'number');
  assert.equal(f('response_window_ms').nullable, true);
  assert.equal(f('iti_ms').kind, 'duration');
  assert.equal(f('trial_feedback').kind, 'enum');
  assert.equal(f('condition_proportions').kind, 'map');
  assert.equal(f('condition_proportions').valueField.kind, 'number');
  assert.equal(f('adaptive').kind, 'bundle');
  assert.equal(f('adaptive').children.length, 3);
  assert.equal(f('tags').kind, 'array');
  assert.equal(f('flag').kind, 'boolean');
  assert.equal(f('weird').kind, 'json');
  assert.equal(m.classify({type: 'array', items: {type: 'object'}}), 'json');
});

test('absentValue none adds a "none" enum choice', () => {
  const g = m.fieldModel('x', {type: 'string', enum: ['a', 'b'], 'x-jspsych': {absentValue: 'none'}});
  assert.deepEqual(g.enumValues, ['none', 'a', 'b']);
});

test('groups follow layer order, unknown groups after, no-group last', () => {
  const groups = m.groupFields(fields);
  assert.deepEqual(groups.map((g) => g.id), ['timing', 'design', 'procedure', 'feedback', 'zzz_custom', 'other']);
  assert.equal(groups[0].label, 'Timing');
  assert.equal(groups.find((g) => g.id === 'zzz_custom').advanced.length, 1);
  assert.equal(groups.find((g) => g.id === 'zzz_custom').basic.length, 0);
});

test('phase-overridable fields are found', () => {
  assert.deepEqual(m.phaseOverridableFields(fields).map((x) => x.name), ['response_window_ms', 'trial_feedback']);
});

test('setOption drops values equal to the default', () => {
  let o = m.setOption(f('response_window_ms'), {}, 1000);
  assert.deepEqual(o, {response_window_ms: 1000});
  o = m.setOption(f('response_window_ms'), o, 1500);
  assert.deepEqual(o, {});
  o = m.setOption(f('condition_proportions'), o, {congruent: 0.5, incongruent: 0.5});
  assert.deepEqual(o, {});
  o = m.setOption(f('response_window_ms'), {}, null);
  assert.deepEqual(o, {response_window_ms: null});
  assert.deepEqual(m.setOption(f('tags'), {tags: ['a']}, undefined), {});
});

test('diffOptions keeps only non-default known keys', () => {
  const d = m.diffOptions(fields, {response_window_ms: 1500, iti_ms: {min: 1, max: 2}, bogus: 1, trial_feedback: 'rt', adaptive: null});
  assert.deepEqual(d, {iti_ms: {min: 1, max: 2}, trial_feedback: 'rt'});
});

test('splitOptions separates practice and drops non-overridable practice keys', () => {
  const s = m.splitOptions(fields, {trial_feedback: 'rt', practice: {trial_feedback: 'accuracy', iti_ms: 5, nope: 1}});
  assert.deepEqual(s.overrides, {trial_feedback: 'rt'});
  assert.deepEqual(s.practice, {trial_feedback: 'accuracy'});
  assert.deepEqual(m.buildOptions(s.overrides, s.practice), {trial_feedback: 'rt', practice: {trial_feedback: 'accuracy'}});
  assert.deepEqual(m.buildOptions({}, {}), {});
});

test('initialBundleValue fills defaults and required fields', () => {
  assert.deepEqual(m.initialBundleValue(f('adaptive')), {procedure: 'a', start_level: 1});
});

test('validation: types, ranges, enums, oneOf, bundles, practice', () => {
  const v = (o) => m.validateOptions(schema, fields, o).map((e) => e.path);
  assert.deepEqual(v({}), []);
  assert.deepEqual(v({response_window_ms: null, iti_ms: {min: 100, max: 200}}), []);
  assert.deepEqual(v({response_window_ms: -5}), ['response_window_ms']);
  assert.deepEqual(v({response_window_ms: 'x'}), ['response_window_ms']);
  assert.deepEqual(v({trial_feedback: 'bad'}), ['trial_feedback']);
  assert.deepEqual(v({iti_ms: {min: 1}}), ['iti_ms.max']);
  assert.deepEqual(v({iti_ms: -1}), ['iti_ms']);
  assert.deepEqual(v({condition_proportions: {a: 2}}), ['condition_proportions.a']);
  assert.deepEqual(v({adaptive: {start_level: 1}}), ['adaptive.procedure']);
  assert.deepEqual(v({practice: {trial_feedback: 'nope'}}), ['practice.trial_feedback']);
  assert.deepEqual(v({practice: {iti_ms: 1}}), ['practice.iti_ms']);
  assert.equal(m.errorsFor(m.validateOptions(schema, fields, {practice: {trial_feedback: 'nope'}}), 'trial_feedback', true).length, 1);
  assert.equal(m.errorsFor(m.validateOptions(schema, fields, {trial_feedback: 'nope'}), 'trial_feedback', true).length, 0);
});

test('hash codec round-trips unicode and tolerates garbage', () => {
  const opts = {label: 'héllo ✓ <script>', n: 3, nested: {a: [1, 2]}};
  const enc = m.encodeOptionsToHash('opts', opts);
  assert.match(enc, /^opts=[A-Za-z0-9_-]+$/);
  assert.deepEqual(m.decodeOptionsFromHash('opts', '#foo=1&' + enc), opts);
  assert.equal(m.decodeOptionsFromHash('opts', '#opts=%%%'), null);
  assert.equal(m.decodeOptionsFromHash('opts', '#other=1'), null);
  assert.equal(m.decodeOptionsFromHash('a', '#' + m.encodeOptionsToHash('b', opts)), null);
  assert.equal(m.updateHash('opts', '#x=1&' + enc, {}), '#x=1');
  assert.equal(m.updateHash('opts', '', {a: 1}), '#' + m.encodeOptionsToHash('opts', {a: 1}));
});

test('snippet and srcdoc embed options safely', () => {
  const refs = {jspsychVersion: '8.2.2', dependencyUrls: ['https://x/dep.js'], bundleUrl: 'https://x/b.js', globalName: 'jsPsychTimelineFlanker'};
  const code = m.buildSnippet({...refs, options: {a: 1, 'b-c': [1, 2], practice: {x: null}}});
  assert.match(code, /jsPsychTimelineFlanker\.createTimeline\(jsPsych, \{/);
  assert.match(code, /a: 1/);
  assert.match(code, /"b-c": \[1, 2\]/);
  assert.match(code, /jsPsych\.run\(timeline\)/);
  assert.match(m.buildSnippet({...refs, options: {}}), /createTimeline\(jsPsych\);/);
  const doc = m.buildTimelineSrcDoc({...refs, options: {t: '</script><b>'}, nonce: 'n1'});
  assert.ok(!doc.includes('</script><b>'));
  assert.ok(doc.includes('\\u003c/script>'));
  assert.ok(doc.includes('https://x/dep.js'));
});

test('resolveScriptUrl', () => {
  const r = (p) => 'https://site' + p;
  assert.equal(m.resolveScriptUrl('https://a/b.js', r), 'https://a/b.js');
  assert.equal(m.resolveScriptUrl('/b.js', r), 'https://site/b.js');
  assert.equal(m.resolveScriptUrl('@jspsych/plugin-x@1.0.0', r), 'https://unpkg.com/@jspsych/plugin-x@1.0.0');
});

test('CSV uses union of columns and quotes properly', () => {
  const rows = [{a: 1, b: 'x,y'}, {a: 2, c: 'say "hi"', d: {k: 1}}, {a: null}];
  assert.deepEqual(m.dataColumns(rows), ['a', 'b', 'c', 'd']);
  assert.equal(m.toCsv(rows), 'a,b,c,d\r\n1,"x,y",,\r\n2,,"say ""hi""","{""k"":1}"\r\n,,,');
  assert.deepEqual(m.parseTrialData('[{"a":1},3]'), [{a: 1}]);
  assert.deepEqual(m.parseTrialData('nonsense'), []);
});

test('presets come from prop or schema', () => {
  const s = {...schema, 'x-jspsych-presets': [{id: 'S1', label: 'A', options: {}}]};
  assert.equal(m.resolvePresets(s).length, 1);
  assert.equal(m.resolvePresets(s, []).length, 0);
  assert.equal(m.resolvePresets(schema).length, 0);
});
