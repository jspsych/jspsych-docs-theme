import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

/**
 * jsPsych dot-brain mark, inlined so each of the 62 dots animates on its own.
 * Generated from static/img/jspsych-logo-no-text.svg by scripts/gen-brain.mjs —
 * do not hand-edit; rerun the generator instead.
 *
 * On hover, a signal propagates from the brain's centre along a SPARSE neighbour
 * graph: dots fire in succession as the activation branches outward, and it
 * peters out before reaching the periphery, so a subset of dots stay dark. Dots
 * that fire carry styles.fires plus:
 *   --fd   : fire delay (its position in the propagation order)
 *   --fs   : peak pop scale (varied per dot for bursty liveliness)
 *   --fdur : flash duration (varied per dot)
 *   --g    : its own fill, reused as the glow color when it fires
 * Dots without styles.fires never animate. Pure CSS, triggered by
 * .navbar__brand:hover (see styles.module.css).
 *
 * Each dot also carries data-i (its index). BRAIN_GRAPH (exported below) holds
 * the neighbour graph + dot centres so HeroBrain can replay the cascade from a
 * random seed on a timer, via the data-fire trigger in styles.module.css.
 */
export default function JspsychBrain({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>): React.ReactElement {
  return (
    <svg
      viewBox="0 0 332.36853 332.62159"
      role="img"
      aria-label="jsPsych"
      className={clsx(styles.brain, className)}
      {...props}>
      <g transform="matrix(1.3333333,0,0,-1.3333333,-160.1236,397.56039)">
      <g transform="translate(270.4785,165.3169)">
        <path data-i="0" className={clsx(styles.dot, styles.fires)} style={{ fill: '#006838', ['--fd']: '1ms', ['--fs']: '1.372', ['--fdur']: '507ms', ['--g']: '#006838' } as React.CSSProperties} d="m 0,0 c 0,-7.729 -6.267,-13.997 -14,-13.997 -7.732,0 -14.001,6.268 -14.001,13.997 0,7.733 6.269,14.002 14.001,14.002 C -6.267,14.002 0,7.733 0,0" />
      </g>
      <g transform="translate(217.541,123.3291)">
        <path data-i="1" className={clsx(styles.dot, styles.fires)} style={{ fill: '#006838', ['--fd']: '437ms', ['--fs']: '1.408', ['--fdur']: '538ms', ['--g']: '#006838' } as React.CSSProperties} d="m 0,0 c 0,-7.729 -6.267,-13.994 -14,-13.994 -7.732,0 -14.001,6.265 -14.001,13.994 0,7.725 6.269,13.991 14.001,13.991 C -6.267,13.991 0,7.725 0,0" />
      </g>
      <g transform="translate(293.4795,138.3164)">
        <path data-i="2" className={styles.dot} style={{ fill: '#006838' }} d="m 0,0 c 0,-7.725 -6.267,-13.982 -14,-13.982 -7.732,0 -14.001,6.257 -14.001,13.982 0,7.734 6.269,14.003 14.001,14.003 C -6.267,14.003 0,7.734 0,0" />
      </g>
      <g transform="translate(262.4873,130.3223)">
        <path data-i="3" className={styles.dot} style={{ fill: '#006838' }} d="m 0,0 c 0,-5.85 -4.752,-10.603 -10.614,-10.603 -5.858,0 -10.609,4.753 -10.609,10.603 0,5.859 4.751,10.611 10.609,10.611 C -4.752,10.611 0,5.859 0,0" />
      </g>
      <g transform="translate(303.7871,162.2817)">
        <path data-i="4" className={clsx(styles.dot, styles.fires)} style={{ fill: '#006838', ['--fd']: '550ms', ['--fs']: '1.566', ['--fdur']: '483ms', ['--g']: '#006838' } as React.CSSProperties} d="m 0,0 c 0,-5.859 -4.752,-10.611 -10.614,-10.611 -5.862,0 -10.614,4.752 -10.614,10.611 0,5.863 4.752,10.616 10.614,10.616 C -4.752,10.616 0,5.863 0,0" />
      </g>
      <g transform="translate(212.1562,147.3887)">
        <path data-i="5" className={clsx(styles.dot, styles.fires)} style={{ fill: '#006838', ['--fd']: '541ms', ['--fs']: '1.342', ['--fdur']: '471ms', ['--g']: '#006838' } as React.CSSProperties} d="m 0,0 c 0,-3.496 -2.835,-6.332 -6.333,-6.332 -3.498,0 -6.334,2.836 -6.334,6.332 0,3.499 2.836,6.334 6.334,6.334 C -2.835,6.334 0,3.499 0,0" />
      </g>
      <g transform="translate(240.0127,132.0249)">
        <path data-i="6" className={clsx(styles.dot, styles.fires)} style={{ fill: '#006838', ['--fd']: '357ms', ['--fs']: '1.248', ['--fdur']: '563ms', ['--g']: '#006838' } as React.CSSProperties} d="m 0,0 c 0,-3.489 -2.834,-6.321 -6.332,-6.321 -3.498,0 -6.334,2.832 -6.334,6.321 0,3.497 2.836,6.333 6.334,6.333 C -2.834,6.333 0,3.497 0,0" />
      </g>
      <g transform="translate(306.4268,144.3188)">
        <path data-i="7" className={styles.dot} style={{ fill: '#006838' }} d="m 0,0 c 0,-3.496 -2.835,-6.332 -6.333,-6.332 -3.498,0 -6.333,2.836 -6.333,6.332 0,3.499 2.835,6.334 6.333,6.334 C -2.835,6.334 0,3.499 0,0" />
      </g>
      <g transform="translate(228.6377,112.7861)">
        <path data-i="8" className={styles.dot} style={{ fill: '#006838' }} d="m 0,0 c 0,-3.496 -2.836,-6.332 -6.334,-6.332 -3.498,0 -6.333,2.836 -6.333,6.332 0,3.498 2.835,6.334 6.333,6.334 C -2.836,6.334 0,3.498 0,0" />
      </g>
      <g transform="translate(228.2354,124.5215)">
        <path data-i="9" className={styles.dot} style={{ fill: '#006838' }} d="m 0,0 c 0,-2.101 -1.706,-3.806 -3.809,-3.806 -2.103,0 -3.808,1.705 -3.808,3.806 0,2.101 1.705,3.805 3.808,3.805 C -1.706,3.805 0,2.101 0,0" />
      </g>
      <g transform="translate(278.2354,156.7061)">
        <path data-i="10" className={clsx(styles.dot, styles.fires)} style={{ fill: '#006838', ['--fd']: '190ms', ['--fs']: '1.391', ['--fdur']: '510ms', ['--g']: '#006838' } as React.CSSProperties} d="m 0,0 c 0,-2.104 -1.706,-3.809 -3.809,-3.809 -2.103,0 -3.808,1.705 -3.808,3.809 0,2.103 1.705,3.809 3.808,3.809 C -1.706,3.809 0,2.103 0,0" />
      </g>
      <g transform="translate(239.9023,164.7754)">
        <path data-i="11" className={clsx(styles.dot, styles.fires)} style={{ fill: '#006838', ['--fd']: '337ms', ['--fs']: '1.253', ['--fdur']: '385ms', ['--g']: '#006838' } as React.CSSProperties} d="m 0,0 c 0,-2.103 -1.707,-3.808 -3.809,-3.808 -2.104,0 -3.809,1.705 -3.809,3.808 0,2.104 1.705,3.809 3.809,3.809 C -1.707,3.809 0,2.104 0,0" />
      </g>
      <g transform="translate(238.5674,111.8584)">
        <path data-i="12" className={clsx(styles.dot, styles.fires)} style={{ fill: '#006838', ['--fd']: '471ms', ['--fs']: '1.347', ['--fdur']: '563ms', ['--g']: '#006838' } as React.CSSProperties} d="m 0,0 c 0,-2.104 -1.705,-3.809 -3.809,-3.809 -2.103,0 -3.807,1.705 -3.807,3.809 0,2.104 1.704,3.809 3.807,3.809 C -1.705,3.809 0,2.104 0,0" />
      </g>
      <g transform="translate(319.5498,159.0034)">
        <path data-i="13" className={clsx(styles.dot, styles.fires)} style={{ fill: '#006838', ['--fd']: '580ms', ['--fs']: '1.571', ['--fdur']: '504ms', ['--g']: '#006838' } as React.CSSProperties} d="m 0,0 c 0,-2.104 -1.706,-3.809 -3.809,-3.809 -2.103,0 -3.807,1.705 -3.807,3.809 0,2.104 1.704,3.809 3.807,3.809 C -1.706,3.809 0,2.104 0,0" />
      </g>
      <g transform="translate(265.0596,144.313)">
        <path data-i="14" className={clsx(styles.dot, styles.fires)} style={{ fill: '#006838', ['--fd']: '240ms', ['--fs']: '1.272', ['--fdur']: '508ms', ['--g']: '#006838' } as React.CSSProperties} d="m 0,0 c 0,-2.103 -1.707,-3.808 -3.809,-3.808 -2.103,0 -3.808,1.705 -3.808,3.808 0,2.104 1.705,3.809 3.808,3.809 C -1.707,3.809 0,2.104 0,0" />
      </g>
      <g transform="translate(220.2705,138.8965)">
        <path data-i="15" className={styles.dot} style={{ fill: '#006838' }} d="m 0,0 c 0,-2.103 -1.707,-3.808 -3.809,-3.808 -2.103,0 -3.808,1.705 -3.808,3.808 0,2.104 1.705,3.809 3.808,3.809 C -1.707,3.809 0,2.104 0,0" />
      </g>
      <g transform="translate(281.3672,167.6523)">
        <path data-i="16" className={clsx(styles.dot, styles.fires)} style={{ fill: '#006838', ['--fd']: '143ms', ['--fs']: '1.397', ['--fdur']: '569ms', ['--g']: '#006838' } as React.CSSProperties} d="m 0,0 c 0,-2.103 -1.706,-3.808 -3.809,-3.808 -2.103,0 -3.807,1.705 -3.807,3.808 0,2.104 1.704,3.809 3.807,3.809 C -1.706,3.809 0,2.104 0,0" />
      </g>
      <g transform="translate(252.2354,146.7056)">
        <path data-i="17" className={clsx(styles.dot, styles.fires)} style={{ fill: '#006838', ['--fd']: '283ms', ['--fs']: '1.535', ['--fdur']: '531ms', ['--g']: '#006838' } as React.CSSProperties} d="m 0,0 c 0,-2.103 -1.706,-3.808 -3.809,-3.808 -2.103,0 -3.808,1.705 -3.808,3.808 0,2.104 1.705,3.809 3.808,3.809 C -1.706,3.809 0,2.104 0,0" />
      </g>
      <g transform="translate(311.2354,153.7056)">
        <path data-i="18" className={clsx(styles.dot, styles.fires)} style={{ fill: '#006838', ['--fd']: '558ms', ['--fs']: '1.372', ['--fdur']: '575ms', ['--g']: '#006838' } as React.CSSProperties} d="m 0,0 c 0,-2.103 -1.706,-3.808 -3.809,-3.808 -2.103,0 -3.808,1.705 -3.808,3.808 0,2.104 1.705,3.809 3.808,3.809 C -1.706,3.809 0,2.104 0,0" />
      </g>
      <g transform="translate(237.958,151.3179)">
        <path data-i="19" className={clsx(styles.dot, styles.fires)} style={{ fill: '#006838', ['--fd']: '295ms', ['--fs']: '1.326', ['--fdur']: '500ms', ['--g']: '#006838' } as React.CSSProperties} d="m 0,0 c 0,-5.858 -4.752,-10.612 -10.614,-10.612 -5.858,0 -10.609,4.754 -10.609,10.612 0,5.863 4.751,10.616 10.609,10.616 C -4.752,10.616 0,5.863 0,0" />
      </g>
      <g transform="translate(180.4268,145.812)">
        <path data-i="20" className={clsx(styles.dot, styles.fires)} style={{ fill: '#f78f1e', ['--fd']: '642ms', ['--fs']: '1.566', ['--fdur']: '384ms', ['--g']: '#f78f1e' } as React.CSSProperties} d="m 0,0 c 0,-3.497 -2.835,-6.333 -6.333,-6.333 -3.498,0 -6.333,2.836 -6.333,6.333 0,3.498 2.835,6.334 6.333,6.334 C -2.835,6.334 0,3.498 0,0" />
      </g>
      <g transform="translate(219.0283,174.7998)">
        <path data-i="21" className={clsx(styles.dot, styles.fires)} style={{ fill: '#f78f1e', ['--fd']: '432ms', ['--fs']: '1.331', ['--fdur']: '492ms', ['--g']: '#f78f1e' } as React.CSSProperties} d="m 0,0 c 0,-7.729 -6.268,-13.996 -14,-13.996 -7.732,0 -14.002,6.267 -14.002,13.996 0,7.734 6.27,14.003 14.002,14.003 C -6.268,14.003 0,7.734 0,0" />
      </g>
      <g transform="translate(163.0937,180.9414)">
        <path data-i="22" className={styles.dot} style={{ fill: '#f78f1e' }} d="m 0,0 c 0,-7.729 -6.267,-13.996 -14,-13.996 -7.732,0 -14.001,6.267 -14.001,13.996 0,7.734 6.269,14.003 14.001,14.003 C -6.267,14.003 0,7.734 0,0" />
      </g>
      <g transform="translate(219.7939,213.999)">
        <path data-i="23" className={clsx(styles.dot, styles.fires)} style={{ fill: '#f78f1e', ['--fd']: '505ms', ['--fs']: '1.563', ['--fdur']: '404ms', ['--g']: '#f78f1e' } as React.CSSProperties} d="m 0,0 c 0,-7.729 -6.267,-13.996 -14,-13.996 -7.732,0 -14.001,6.267 -14.001,13.996 0,7.734 6.269,14.003 14.001,14.003 C -6.267,14.003 0,7.734 0,0" />
      </g>
      <g transform="translate(247.3955,222.7163)">
        <path data-i="24" className={styles.dot} style={{ fill: '#f78f1e' }} d="m 0,0 c 0,-5.859 -4.752,-10.611 -10.613,-10.611 -5.862,0 -10.614,4.752 -10.614,10.611 0,5.863 4.752,10.615 10.614,10.615 C -4.752,10.615 0,5.863 0,0" />
      </g>
      <g transform="translate(181.041,164.7744)">
        <path data-i="25" className={clsx(styles.dot, styles.fires)} style={{ fill: '#f78f1e', ['--fd']: '707ms', ['--fs']: '1.469', ['--fdur']: '418ms', ['--g']: '#f78f1e' } as React.CSSProperties} d="m 0,0 c 0,-5.859 -4.752,-10.611 -10.614,-10.611 -5.862,0 -10.614,4.752 -10.614,10.611 0,5.863 4.752,10.615 10.614,10.615 C -4.752,10.615 0,5.863 0,0" />
      </g>
      <g transform="translate(176.708,207.5557)">
        <path data-i="26" className={styles.dot} style={{ fill: '#f78f1e' }} d="m 0,0 c 0,-5.859 -4.752,-10.611 -10.615,-10.611 -5.862,0 -10.614,4.752 -10.614,10.611 0,5.863 4.752,10.615 10.614,10.615 C -4.752,10.615 0,5.863 0,0" />
      </g>
      <g transform="translate(157.4795,150.1606)">
        <path data-i="27" className={styles.dot} style={{ fill: '#f78f1e' }} d="m 0,0 c 0,-5.859 -4.752,-10.611 -10.613,-10.611 -5.862,0 -10.614,4.752 -10.614,10.611 0,5.863 4.752,10.615 10.614,10.615 C -4.752,10.615 0,5.863 0,0" />
      </g>
      <g transform="translate(182.041,185.3882)">
        <path data-i="28" className={styles.dot} style={{ fill: '#f78f1e' }} d="m 0,0 c 0,-3.496 -2.835,-6.332 -6.333,-6.332 -3.498,0 -6.334,2.836 -6.334,6.332 0,3.499 2.836,6.334 6.334,6.334 C -2.835,6.334 0,3.499 0,0" />
      </g>
      <g transform="translate(194.584,157.9946)">
        <path data-i="29" className={clsx(styles.dot, styles.fires)} style={{ fill: '#f78f1e', ['--fd']: '636ms', ['--fs']: '1.423', ['--fdur']: '513ms', ['--g']: '#f78f1e' } as React.CSSProperties} d="m 0,0 c 0,-3.496 -2.835,-6.332 -6.333,-6.332 -3.498,0 -6.333,2.836 -6.333,6.332 0,3.499 2.835,6.334 6.333,6.334 C -2.835,6.334 0,3.499 0,0" />
      </g>
      <g transform="translate(191.041,222.7173)">
        <path data-i="30" className={clsx(styles.dot, styles.fires)} style={{ fill: '#f78f1e', ['--fd']: '614ms', ['--fs']: '1.447', ['--fdur']: '528ms', ['--g']: '#f78f1e' } as React.CSSProperties} d="m 0,0 c 0,-3.496 -2.835,-6.332 -6.333,-6.332 -3.498,0 -6.334,2.836 -6.334,6.332 0,3.499 2.836,6.334 6.334,6.334 C -2.835,6.334 0,3.499 0,0" />
      </g>
      <g transform="translate(204.1084,193.9229)">
        <path data-i="31" className={styles.dot} style={{ fill: '#f78f1e' }} d="m 0,0 c 0,-2.103 -1.706,-3.808 -3.809,-3.808 -2.103,0 -3.808,1.705 -3.808,3.808 0,2.104 1.705,3.809 3.808,3.809 C -1.706,3.809 0,2.104 0,0" />
      </g>
      <g transform="translate(223.834,235.9478)">
        <path data-i="32" className={styles.dot} style={{ fill: '#f78f1e' }} d="m 0,0 c 0,-2.103 -1.706,-3.808 -3.809,-3.808 -2.103,0 -3.807,1.705 -3.807,3.808 0,2.104 1.704,3.809 3.807,3.809 C -1.706,3.809 0,2.104 0,0" />
      </g>
      <g transform="translate(255.8447,236.6113)">
        <path data-i="33" className={styles.dot} style={{ fill: '#f78f1e' }} d="m 0,0 c 0,-2.103 -1.706,-3.808 -3.809,-3.808 -2.103,0 -3.808,1.705 -3.808,3.808 0,2.104 1.705,3.809 3.808,3.809 C -1.706,3.809 0,2.104 0,0" />
      </g>
      <g transform="translate(155.9014,131.3208)">
        <path data-i="34" className={styles.dot} style={{ fill: '#f78f1e' }} d="m 0,0 c 0,-2.099 -1.705,-3.801 -3.809,-3.801 -2.103,0 -3.807,1.702 -3.807,3.801 0,2.102 1.704,3.807 3.807,3.807 C -1.705,3.807 0,2.102 0,0" />
      </g>
      <g transform="translate(186.377,128.5161)">
        <path data-i="35" className={styles.dot} style={{ fill: '#f78f1e' }} d="m 0,0 c 0,-2.099 -1.706,-3.801 -3.809,-3.801 -2.103,0 -3.807,1.702 -3.807,3.801 0,2.101 1.704,3.805 3.807,3.805 C -1.706,3.805 0,2.101 0,0" />
      </g>
      <g transform="translate(233.0928,205.7705)">
        <path data-i="36" className={clsx(styles.dot, styles.fires)} style={{ fill: '#f78f1e', ['--fd']: '417ms', ['--fs']: '1.359', ['--fdur']: '598ms', ['--g']: '#f78f1e' } as React.CSSProperties} d="m 0,0 c 0,-3.496 -2.835,-6.332 -6.333,-6.332 -3.498,0 -6.333,2.836 -6.333,6.332 0,3.499 2.835,6.334 6.333,6.334 C -2.835,6.334 0,3.499 0,0" />
      </g>
      <g transform="translate(196.6279,145.7632)">
        <path data-i="37" className={clsx(styles.dot, styles.fires)} style={{ fill: '#f78f1e', ['--fd']: '589ms', ['--fs']: '1.508', ['--fdur']: '497ms', ['--g']: '#f78f1e' } as React.CSSProperties} d="m 0,0 c 0,-2.103 -1.707,-3.808 -3.809,-3.808 -2.103,0 -3.808,1.705 -3.808,3.808 0,2.104 1.705,3.809 3.808,3.809 C -1.707,3.809 0,2.104 0,0" />
      </g>
      <g transform="translate(192.041,203.7705)">
        <path data-i="38" className={clsx(styles.dot, styles.fires)} style={{ fill: '#f78f1e', ['--fd']: '558ms', ['--fs']: '1.271', ['--fdur']: '493ms', ['--g']: '#f78f1e' } as React.CSSProperties} d="m 0,0 c 0,-3.496 -2.835,-6.332 -6.333,-6.332 -3.498,0 -6.334,2.836 -6.334,6.332 0,3.499 2.836,6.334 6.334,6.334 C -2.835,6.334 0,3.499 0,0" />
      </g>
      <g transform="translate(172.4272,131.3208)">
        <path data-i="39" className={styles.dot} style={{ fill: '#f78f1e' }} d="m 0,0 c 0,-3.491 -2.835,-6.323 -6.333,-6.323 -3.498,0 -6.334,2.832 -6.334,6.323 0,3.496 2.836,6.332 6.334,6.332 C -2.835,6.332 0,3.496 0,0" />
      </g>
      <g transform="translate(327.8945,176.7759)">
        <path data-i="40" className={styles.dot} style={{ fill: '#ee4523' }} d="m 0,0 c 0,-3.496 -2.836,-6.332 -6.334,-6.332 -3.497,0 -6.333,2.836 -6.333,6.332 0,3.499 2.836,6.334 6.333,6.334 C -2.836,6.334 0,3.499 0,0" />
      </g>
      <g transform="translate(328.3701,134.2197)">
        <path data-i="41" className={clsx(styles.dot, styles.fires)} style={{ fill: '#ee4523', ['--fd']: '661ms', ['--fs']: '1.27', ['--fdur']: '584ms', ['--g']: '#ee4523' } as React.CSSProperties} d="m 0,0 c 0,-2.101 -1.707,-3.804 -3.809,-3.804 -2.103,0 -3.808,1.703 -3.808,3.804 0,2.104 1.705,3.809 3.808,3.809 C -1.707,3.809 0,2.104 0,0" />
      </g>
      <g transform="translate(313.3701,134.3184)">
        <path data-i="42" className={styles.dot} style={{ fill: '#ee4523' }} d="m 0,0 c 0,-2.1 -1.706,-3.803 -3.809,-3.803 -2.103,0 -3.808,1.703 -3.808,3.803 0,2.104 1.705,3.809 3.808,3.809 C -1.706,3.809 0,2.104 0,0" />
      </g>
      <g transform="translate(354.3691,155.9951)">
        <path data-i="43" className={clsx(styles.dot, styles.fires)} style={{ fill: '#ee4523', ['--fd']: '711ms', ['--fs']: '1.414', ['--fdur']: '594ms', ['--g']: '#ee4523' } as React.CSSProperties} d="m 0,0 c 0,-2.103 -1.706,-3.808 -3.809,-3.808 -2.103,0 -3.807,1.705 -3.807,3.808 0,2.104 1.704,3.809 3.807,3.809 C -1.706,3.809 0,2.104 0,0" />
      </g>
      <g transform="translate(341.9834,185.561)">
        <path data-i="44" className={styles.dot} style={{ fill: '#ee4523' }} d="m 0,0 c 0,-2.103 -1.707,-3.808 -3.809,-3.808 -2.103,0 -3.808,1.705 -3.808,3.808 0,2.104 1.705,3.809 3.808,3.809 C -1.707,3.809 0,2.104 0,0" />
      </g>
      <g transform="translate(349.3154,141.6274)">
        <path data-i="45" className={styles.dot} style={{ fill: '#ee4523' }} d="m 0,0 c 0,-3.496 -2.834,-6.332 -6.332,-6.332 -3.498,0 -6.334,2.836 -6.334,6.332 0,3.499 2.836,6.334 6.334,6.334 C -2.834,6.334 0,3.499 0,0" />
      </g>
      <g transform="translate(350.1221,169.8418)">
        <path data-i="46" className={styles.dot} style={{ fill: '#ee4523' }} d="m 0,0 c 0,-5.859 -4.752,-10.611 -10.614,-10.611 -5.862,0 -10.614,4.752 -10.614,10.611 0,5.863 4.752,10.615 10.614,10.615 C -4.752,10.615 0,5.863 0,0" />
      </g>
      <g transform="translate(334.8945,148.9609)">
        <path data-i="47" className={clsx(styles.dot, styles.fires)} style={{ fill: '#ee4523', ['--fd']: '621ms', ['--fs']: '1.436', ['--fdur']: '403ms', ['--g']: '#ee4523' } as React.CSSProperties} d="m 0,0 c 0,-3.496 -2.835,-6.332 -6.333,-6.332 -3.498,0 -6.333,2.836 -6.333,6.332 0,3.499 2.835,6.334 6.333,6.334 C -2.835,6.334 0,3.499 0,0" />
      </g>
      <g transform="translate(328.3691,162.8115)">
        <path data-i="48" className={clsx(styles.dot, styles.fires)} style={{ fill: '#ee4523', ['--fd']: '589ms', ['--fs']: '1.579', ['--fdur']: '431ms', ['--g']: '#ee4523' } as React.CSSProperties} d="m 0,0 c 0,-2.103 -1.706,-3.808 -3.809,-3.808 -2.103,0 -3.807,1.705 -3.807,3.808 0,2.104 1.704,3.809 3.807,3.809 C -1.706,3.809 0,2.104 0,0" />
      </g>
      <g transform="translate(319.5498,144.3193)">
        <path data-i="49" className={clsx(styles.dot, styles.fires)} style={{ fill: '#ee4523', ['--fd']: '634ms', ['--fs']: '1.361', ['--fdur']: '477ms', ['--g']: '#ee4523' } as React.CSSProperties} d="m 0,0 c 0,-2.103 -1.706,-3.808 -3.809,-3.808 -2.103,0 -3.807,1.705 -3.807,3.808 0,2.104 1.704,3.809 3.807,3.809 C -1.706,3.809 0,2.104 0,0" />
      </g>
      <g transform="translate(270.0937,203.9995)">
        <path data-i="50" className={clsx(styles.dot, styles.fires)} style={{ fill: '#13b24b', ['--fd']: '158ms', ['--fs']: '1.523', ['--fdur']: '531ms', ['--g']: '#13b24b' } as React.CSSProperties} d="m 0,0 c 0,-7.729 -6.267,-13.996 -14,-13.996 -7.732,0 -14.001,6.267 -14.001,13.996 0,7.734 6.269,14.003 14.001,14.003 C -6.267,14.003 0,7.734 0,0" />
      </g>
      <g transform="translate(306.5967,189)">
        <path data-i="51" className={clsx(styles.dot, styles.fires)} style={{ fill: '#13b24b', ['--fd']: '444ms', ['--fs']: '1.418', ['--fdur']: '533ms', ['--g']: '#13b24b' } as React.CSSProperties} d="m 0,0 c 0,-7.729 -6.268,-13.996 -14,-13.996 -7.732,0 -14.002,6.267 -14.002,13.996 0,7.734 6.27,14.003 14.002,14.003 C -6.268,14.003 0,7.734 0,0" />
      </g>
      <g transform="translate(246.707,184.3882)">
        <path data-i="52" className={clsx(styles.dot, styles.fires)} style={{ fill: '#13b24b', ['--fd']: '420ms', ['--fs']: '1.445', ['--fdur']: '519ms', ['--g']: '#13b24b' } as React.CSSProperties} d="m 0,0 c 0,-5.859 -4.752,-10.611 -10.614,-10.611 -5.862,0 -10.614,4.752 -10.614,10.611 0,5.863 4.752,10.615 10.614,10.615 C -4.752,10.615 0,5.863 0,0" />
      </g>
      <g transform="translate(293.1729,226.0005)">
        <path data-i="53" className={clsx(styles.dot, styles.fires)} style={{ fill: '#13b24b', ['--fd']: '295ms', ['--fs']: '1.25', ['--fdur']: '452ms', ['--g']: '#13b24b' } as React.CSSProperties} d="m 0,0 c 0,-5.859 -4.752,-10.611 -10.614,-10.611 -5.862,0 -10.614,4.752 -10.614,10.611 0,5.863 4.752,10.615 10.614,10.615 C -4.752,10.615 0,5.863 0,0" />
      </g>
      <g transform="translate(332.7881,195.3877)">
        <path data-i="54" className={clsx(styles.dot, styles.fires)} style={{ fill: '#13b24b', ['--fd']: '618ms', ['--fs']: '1.351', ['--fdur']: '501ms', ['--g']: '#13b24b' } as React.CSSProperties} d="m 0,0 c 0,-5.859 -4.752,-10.611 -10.614,-10.611 -5.862,0 -10.614,4.752 -10.614,10.611 0,5.863 4.752,10.615 10.614,10.615 C -4.752,10.615 0,5.863 0,0" />
      </g>
      <g transform="translate(274.4238,183.7744)">
        <path data-i="55" className={clsx(styles.dot, styles.fires)} style={{ fill: '#13b24b', ['--fd']: '68ms', ['--fs']: '1.457', ['--fdur']: '488ms', ['--g']: '#13b24b' } as React.CSSProperties} d="m 0,0 c 0,-3.496 -2.835,-6.332 -6.333,-6.332 -3.498,0 -6.334,2.836 -6.334,6.332 0,3.499 2.836,6.334 6.334,6.334 C -2.835,6.334 0,3.499 0,0" />
      </g>
      <g transform="translate(284.0801,207.1611)">
        <path data-i="56" className={clsx(styles.dot, styles.fires)} style={{ fill: '#13b24b', ['--fd']: '200ms', ['--fs']: '1.221', ['--fdur']: '552ms', ['--g']: '#13b24b' } as React.CSSProperties} d="m 0,0 c 0,-3.496 -2.835,-6.332 -6.333,-6.332 -3.498,0 -6.333,2.836 -6.333,6.332 0,3.499 2.835,6.334 6.333,6.334 C -2.835,6.334 0,3.499 0,0" />
      </g>
      <g transform="translate(312.9336,207.5562)">
        <path data-i="57" className={styles.dot} style={{ fill: '#13b24b' }} d="m 0,0 c 0,-3.496 -2.835,-6.332 -6.333,-6.332 -3.498,0 -6.334,2.836 -6.334,6.332 0,3.499 2.836,6.334 6.334,6.334 C -2.835,6.334 0,3.499 0,0" />
      </g>
      <g transform="translate(312.3691,172.9443)">
        <path data-i="58" className={styles.dot} style={{ fill: '#13b24b' }} d="m 0,0 c 0,-2.103 -1.706,-3.808 -3.809,-3.808 -2.103,0 -3.807,1.705 -3.807,3.808 0,2.104 1.704,3.809 3.807,3.809 C -1.706,3.809 0,2.104 0,0" />
      </g>
      <g transform="translate(306.7861,223.8062)">
        <path data-i="59" className={clsx(styles.dot, styles.fires)} style={{ fill: '#13b24b', ['--fd']: '316ms', ['--fs']: '1.336', ['--fdur']: '461ms', ['--g']: '#13b24b' } as React.CSSProperties} d="m 0,0 c 0,-2.103 -1.706,-3.808 -3.809,-3.808 -2.103,0 -3.808,1.705 -3.808,3.808 0,2.104 1.705,3.809 3.808,3.809 C -1.706,3.809 0,2.104 0,0" />
      </g>
      <g transform="translate(271.0937,234.9478)">
        <path data-i="60" className={clsx(styles.dot, styles.fires)} style={{ fill: '#13b24b', ['--fd']: '247ms', ['--fs']: '1.28', ['--fdur']: '541ms', ['--g']: '#13b24b' } as React.CSSProperties} d="m 0,0 c 0,-2.103 -1.706,-3.808 -3.809,-3.808 -2.103,0 -3.807,1.705 -3.807,3.808 0,2.104 1.704,3.809 3.807,3.809 C -1.706,3.809 0,2.104 0,0" />
      </g>
      <g transform="translate(268.8672,222.7178)">
        <path data-i="61" className={clsx(styles.dot, styles.fires)} style={{ fill: '#13b24b', ['--fd']: '209ms', ['--fs']: '1.465', ['--fdur']: '540ms', ['--g']: '#13b24b' } as React.CSSProperties} d="m 0,0 c 0,-2.103 -1.706,-3.808 -3.809,-3.808 -2.103,0 -3.807,1.705 -3.807,3.808 0,2.104 1.704,3.809 3.807,3.809 C -1.706,3.809 0,2.104 0,0" />
      </g>
      </g>
    </svg>
  );
}

/**
 * Neighbour graph + dot centres + tuning constants for runtime propagation.
 * nodes[i] = [x, y] screen centre of dot i; adj[i] = indices of i's neighbours.
 * Consumed by HeroBrain to ignite a fresh chain from a random seed each pulse.
 */
export const BRAIN_GRAPH = {"nodes":[[200.51,177.14],[129.93,233.12],[231.18,213.14],[189.86,223.8],[244.93,181.18],[122.75,201.04],[159.89,221.53],[248.45,205.14],[144.73,247.18],[144.19,231.53],[210.86,188.62],[159.75,177.86],[157.97,248.42],[265.94,185.56],[193.29,205.14],[133.57,212.37],[215.03,174.02],[176.19,201.95],[254.86,192.62],[157.15,195.8],[80.45,203.14],[131.91,164.49],[57.33,156.31],[132.93,112.23],[169.74,100.61],[81.26,177.86],[75.49,120.82],[49.85,197.35],[82.6,150.38],[99.32,186.9],[94.6,100.6],[112.02,139],[138.32,82.96],[181,82.08],[47.74,222.47],[88.38,226.21],[150.67,123.2],[102.05,203.21],[95.93,125.87],[69.78,222.47],[277.07,161.86],[277.7,218.6],[257.7,218.47],[312.37,189.57],[295.85,150.15],[305.63,208.72],[306.71,171.1],[286.4,198.95],[277.7,180.48],[265.94,205.13],[200,125.56],[248.67,145.56],[168.82,151.71],[230.77,96.23],[283.59,137.04],[205.77,152.53],[218.65,121.35],[257.12,120.82],[256.37,166.97],[248.92,99.15],[201.33,84.3],[198.37,100.6]],"adj":[[55],[9,15,8],[7],[14],[58,18],[15,37],[17,9],[18,42,2,49],[9,12,1],[6,1,8],[16,14],[19,52,21],[8],[18,48,49],[10,17,3],[1,5],[10,55],[14,19,6],[4,13,7],[17,11],[37,39,35,27,29],[11],[28],[36,32,31,38],[33,36],[29,28],[38,28],[34,20],[25,22,38,26,31],[37,25,20],[38],[38,23,28],[23],[60,24],[39,27],[39,20,37],[24,23,52],[5,29,20,35],[28,31,26,30,23],[20,35,34],[48,44,58,54],[49,42,45],[7,49,41],[45,46],[40,54,46],[47,43,41],[43,44],[48,45,49],[13,40,47,58],[42,41,7,13,47],[55,56,61],[57,58],[11,36],[56,59],[44,40],[16,50,0],[50,53],[59,51],[51,4,40,48],[53,57],[61,33],[50,60]],"window":720,"dropBase":0.02,"dropSlope":0.42} as const;
