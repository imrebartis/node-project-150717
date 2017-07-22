import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import autocomplete from './modules/autocomplete';
import typeAhead from './modules/typeAhead';
import makeMap from './modules/map';
import ajaxHeart from './modules/heart';

autocomplete( $('#address'), $('#lat'), $('#lng'));

typeAhead( $('.search') );

makeMap( $('#map') );

const heartForms = $$('form.heart');
// console.log(heartForms);
// due to bling u can listen to multiple events
// on a node list instead of looping thru each event
heartForms.on('submit', ajaxHeart);
