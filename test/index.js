import './d3-funnel/Colorizer';
import './d3-funnel/D3Funnel';
import './d3-funnel/Navigator';
import './d3-funnel/Utils';

/* eslint-disable no-restricted-properties */
// PhantomJS version appears to be old; might need an alternative testing mechanism
// https://github.com/alphasights/ember-scrollable/issues/27
Number.isNaN = value => typeof value === 'number' && window.isNaN(value);
Number.isFinite = value => typeof value === 'number' && window.isFinite(value);
/* eslint-enable no-restricted-properties */
