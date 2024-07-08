/*
diaFRAM is an executable graphical editor in support of the Functional
Resonance Analysis Method developed originally by Erik Hollnagel.
This tool is developed by Pieter Bots at Delft University of Technology.

This JavaScript file (diafram-paper.js) provides the SVG diagram-drawing
functionality for the diaFRAM model editor.

*/

/*
Copyright (c) 2024 Delft University of Technology

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// CLASS Shape
// A shape is a group of one or more SVG elements with a time-based ID
// number, and typically represents an entity in a diaFRAM model diagram.
class Shape {
  constructor() {
    this.id = randomID();
    if(UI.paper) {
      // Create a new SVG element, but do not add it to the main SVG object.
      this.element = UI.paper.newSVGElement('svg');
      this.element.id = this.id;
    }
  }
  
  clear() {
    // Remove all composing elements from this shape's SVG object.
    UI.paper.clearSVGElement(this.element);
  }

  appendToDOM() {
    // Append this shape's SVG element to the main SVG object.
    const el = document.getElementById(this.id);
    // Replace existing element, if it exists.
    if(el) UI.paper.svg.removeChild(el);
    // Add the new version.
    UI.paper.svg.appendChild(this.element);
  }
  
  removeFromDOM() {
    // Remove this shape's SVG element from the main SVG object.
    const el = document.getElementById(this.id);
    if(el) UI.paper.svg.removeChild(el);
    this.element = null;
  }

  addPath(path, attrs) {
    // Append a path to the SVG element for this shape.
    const el = UI.paper.newSVGElement('path');
    el.setAttribute('d', path.join(''));
    UI.paper.addSVGAttributes(el, attrs);
    this.element.appendChild(el);
    return el;
  }
  
  addNumber(x, y, number, attrs) {
    // Append SVG for a numeric string centered at (x, y).
    // NOTES:
    // (1) A numeric string is scaled to a fixed width per character
    //     (0.65*font size).
    // (2) If anchor is not "middle", x is taken as the border to align
    //     against.
    // (3) Calling routines may pass a number instead of a string, so
    //     "lines" is forced to a string.
    number = '' + number;
    // Assume default font size and weight unless specified.
    const
        size = (attrs.hasOwnProperty('font-size') ?
            attrs['font-size'] : 8),
        weight = (attrs.hasOwnProperty('font-weight') ?
            attrs['font-weight'] : 400),
        fh = UI.paper.font_heights[size],
        el = UI.paper.newSVGElement('text');
    el.setAttribute('x', x);
    el.setAttribute('y', y + 0.35*fh);
    el.setAttribute('textLength',
        UI.paper.numberSize(number, size, weight).width);
    el.textContent = number;
    UI.paper.addSVGAttributes(el, attrs);
    this.element.appendChild(el);
    return el;
  }

  addText(x, y, lines, attrs) {
    // Append SVG for a (multi)string centered at (x, y).
    // NOTES:
    // (1) If anchor is not "middle", x is taken as the border to align
    //     against.
    // (2) Calling routines may pass a number, a string or an array.
    if(!Array.isArray(lines)) {
      // Force `lines` into a string, and then split it at newlines.
      lines = ('' + lines).split('\n');
    }
    // Assume default font size unless specified.
    const size = (attrs.hasOwnProperty('font-size') ? attrs['font-size'] : 8);
    // Vertically align text such that y is at its center.
    // NOTE: Subtract 30% of 1 line height more, or the text is consistently
    // too low.
    const
        fh = UI.paper.font_heights[size],
        cy = y - (lines.length + 0.3) * fh/2,
        el = UI.paper.newSVGElement('text');
    el.setAttribute('x', x);
    el.setAttribute('y', cy);
    UI.paper.addSVGAttributes(el, attrs);
    for(let i = 0; i < lines.length; i++) {
      const ts = UI.paper.newSVGElement('tspan');
      ts.setAttribute('x', x);
      ts.setAttribute('dy', fh);
      ts.setAttribute('pointer-events', 'inherit');
      // NOTE: Non-breaking space must now (inside a TSPAN) be converted
      // to normal spaces, or they will be rendered as '&nbsp;' and this
      // will cause the SVG to break when it is inserted as picture into
      // an MS Word document.
      ts.textContent = lines[i].replaceAll('\u00A0', ' ');
      el.appendChild(ts);
    }
    this.element.appendChild(el);
    return el;
  }

  addRect(x, y, w, h, attrs) {
    // Add a rectangle with center point (x, y), width w, and height h.
    // NOTE: For a "roundbox", pass the corner radii rx and ry.
    const el = UI.paper.newSVGElement('rect');
    el.setAttribute('x', x - w/2);
    el.setAttribute('y', y - h/2);
    el.setAttribute('width', Math.max(0, w));
    el.setAttribute('height', Math.max(0, h));
    UI.paper.addSVGAttributes(el, attrs);
    this.element.appendChild(el);
    return el;
  }

  addCircle(x, y, r, attrs) {
    // Add a circle with center point (x, y) and radius r.
    const el = UI.paper.newSVGElement('circle');
    el.setAttribute('cx', x);
    el.setAttribute('cy', y);
    el.setAttribute('r', r);
    UI.paper.addSVGAttributes(el, attrs);
    this.element.appendChild(el);
    return el;
  }

  addEllipse(x, y, rx, ry, attrs) {
    // Add an ellipse with center point (x, y), and specified radii and
    // attributes.
    const el = UI.paper.newSVGElement('ellipse');
    el.setAttribute('cx', x);
    el.setAttribute('cy', y);
    el.setAttribute('rx', rx);
    el.setAttribute('ry', ry);
    UI.paper.addSVGAttributes(el, attrs);
    this.element.appendChild(el);
    return el;
  }

  addSVG(x, y, attrs) {
    // Add an SVG subelement with top-left (x, y) and specified attributes.
    const el = UI.paper.newSVGElement('svg');
    el.setAttribute('x', x);
    el.setAttribute('y', y);
    UI.paper.addSVGAttributes(el, attrs);
    this.element.appendChild(el);
    return el;
  }
  
  addBlockArrow(x, y, io, n) {
    // Add a colored block arrow with the number `n` in white IF n > 0
    // NOTE: the ID of the owner of this shape (cluster, process or product)
    // is passed as data attribute so that the SVG element "knows" for which
    // entity the hidden flows must be displayed. The `io` data attribute
    // indicates whether it concerns IN, OUT or IO flows.
    if(n <= 0) return;
    const
        p = (io === UI.BLOCK_IO ?
            ['M', x-4, ',', y-5, 'h8v-2l6,7l-6,7v-2h-8v2l-6,-7l6,-7z'] :
            ['M', x-6, ',', y-5, 'h10v-2l6,7l-6,7v-2h-10z']),
        a = this.addPath(p,
            {'fill': UI.color.block_arrow, 'stroke': 'black',
                'stroke-width': 0.4, 'stroke-linejoin': 'round',
                'data-id': this.owner.identifier, 'data-io': io});
    this.addText(x, y, n, {'fill': 'white'});
    // Make SVG element responsive to cursor event.
    a.setAttribute('pointer-events', 'auto');
    a.addEventListener('mouseover',
        (event) => {
            const
                el = event.target,
                nb = MODEL.nodeBoxByID(el.dataset.id);
            if(nb) {
              DOCUMENTATION_MANAGER.showHiddenIO(nb,
                  parseInt(el.dataset.io));
            }
          });
    a.addEventListener('mouseout', () => { UI.on_block_arrow = false; });
    return this.element;
  }

  addConnector(x, y, l, id) {
    // Add a connector circle with the letter `l` 
    // NOTE: the ID of the owner of this shape (activity) is passed as
    // data attribute so that the SVG element "knows" for which activity
    // the aspect must be displayed. The `aspect` data attribute is also
    // set to the letter `l`.
    const c = this.addCircle(x, y, 7,
        {fill: 'white', stroke: UI.color.node_rim, 'stroke-width': 0.75,
            'data-id': id, 'data-aspect': l});
    this.addText(x, y, l, {'fill': 'black', 'font-size': 7,
        'data-id': id, 'data-aspect': l});
    // Make SVG elements responsive to cursor event.
    c.setAttribute('pointer-events', 'auto');
    // Only the Output connector can be a tail connector.
    if(l === 'O') c.setAttribute('cursor', 'pointer');
    UI.connector(c);
    return this.element;
  }

  moveTo(x, y) {
    const el = document.getElementById(this.id);
    if(el) {
      el.setAttribute('x', x);
      el.setAttribute('y', y);
    }
  }
  
} // END of class Shape


// CLASS Paper (the SVG diagram)
class Paper {
  constructor() {
    this.svg = document.getElementById('svg-root');
    this.container = document.getElementById('cc');
    this.height = 100;
    this.width = 200;
    this.zoom_factor = 1;
    this.zoom_label = document.getElementById('zoom');
    // Initialize colors used when drawing the model diagram
    this.palette = {
      // Selected model elements are bright red
      select: '#ff0000',    
      // Nodes (clusters, products and processes) have dark gray rim...
      node_rim: '#606070',
      // ... and state-dependent fill colors
      node_fill: '#ffffff',
      src_snk: '#e0e0f0',
      // Font colors for entities
      actor_font: '#40a0e0', // medium blue
      // Process with level > 0 has a dark blue rim and production level font
      active: '#000080',
      // Block arrows are filled in grayish blue
      block_arrow: '#7080a0',
      active_rim: '#00b0ff',
      active_fill: '#80ffff',
      value_fill: '#d0f0ff',
      // All notes have thin gray rim, similar to other model diagram elements,
      // that turns red when a note is selected
      note_rim: '#909090',  // medium gray
      note_font: '#2060a0', // medium dark gray-blue
      // Notes are semi-transparent yellow (will have opacity 0.5).
      note_fill: '#ffff80',
      note_band: '#ffd860',  
      // Computation errors in expressions are signalled by displaying
      // the result in bright red, typically the general error symbol (X)
      VM_error: '#e80000',
      // Background color of GUI dialogs
      dialog_background: '#f4f8ff'
    };
    // Standard SVG URL
    this.svg_url = 'http://www.w3.org/2000/svg';
    this.clear();
  }
  
  get opaqueSVG() {
    // Return SVG as string with nodes and arrows 100% opaque.
    // NOTE: The semi-transparent ovals behind rates on links have
    // opacity 0.8 and hence are not affected.
    return this.svg.outerHTML.replaceAll(' opacity="0.9"', ' opacity="1"');
  }
  
  clear() {
    // First, clear the entire SVG
    this.clearSVGElement(this.svg);
    // Set default style properties
    this.svg.setAttribute('font-family', this.font_name);
    this.svg.setAttribute('font-size', 8);
    this.svg.setAttribute('text-anchor', 'middle');
    this.svg.setAttribute('alignment-baseline', 'middle');
    // Add marker definitions
    const
        defs = this.newSVGElement('defs'),
        // Standard arrow tips: solid triangle
        tri = 'M0,0 L10,5 L0,10 z',
        // Wedge arrow tips have no baseline
        wedge = 'M0,0 L10,5 L0,10 L0,8.5 L8.5,5 L0,1.5 z',
        // link arrows have a flat, "chevron-style" tip
        chev = 'M0,0 L10,5 L0,10 L4,5 z',
        // Feedback arrows are hollow and have hole in their baseline
        fbt = 'M0,3L0,0L10,5L0,10L0,7L1.5,7L1.5,8.5L8.5,5L1.5,1.5L1.5,3z';

    // NOTE: standard SVG elements are defined as properties of this paper
    this.size_box = '__c_o_m_p_u_t_e__b_b_o_x__ID*';
    this.drag_line = '__d_r_a_g__l_i_n_e__ID*';
    this.drag_rect = '__d_r_a_g__r_e_c_t__ID*';
    let id = 't_r_i_a_n_g_l_e__t_i_p__ID*';
    this.triangle = `url(#${id})`;
    this.addMarker(defs, id, tri, 8, this.palette.node_rim);
    id = 'a_c_t_i_v_e__t_r_i_a_n_g_l_e__t_i_p__ID*';
    this.active_triangle = `url(#${id})`;
    this.addMarker(defs, id, tri, 8, this.palette.active_process);
    id = 'a_c_t_i_v_e__r_e_v__t_r_i__t_i_p__ID*';
    this.active_reversed_triangle = `url(#${id})`;
    this.addMarker(defs, id, tri, 8, this.palette.compound_flow);
    id = 'i_n_a_c_t_i_v_e__t_r_i_a_n_g_l_e__t_i_p__ID';
    this.inactive_triangle = `url(#${id})`;
    this.addMarker(defs, id, tri, 8, 'silver');
    id = 'o_p_e_n__t_r_i_a_n_g_l_e__t_i_p__ID*';
    this.open_triangle = `url(#${id})`;
    this.addMarker(defs, id, tri, 7.5, 'white');
    id = 's_e_l_e_c_t_e_d__t_r_i_a_n_g_l_e__t_i_p__ID*';
    this.selected_triangle = `url(#${id})`;
    this.addMarker(defs, id, tri, 7.5, this.palette.select);
    id = 'w_h_i_t_e__t_r_i_a_n_g_l_e__t_i_p__ID*';
    this.white_triangle = `url(#${id})`;
    this.addMarker(defs, id, tri, 9.5, 'white');
    id = 'c_o_n_g_e_s_t_e_d__t_r_i_a_n_g_l_e__t_i_p__ID*';
    this.congested_triangle = `url(#${id})`;
    this.addMarker(defs, id, tri, 7.5, this.palette.at_process_ub_arrow);
    id = 'd_o_u_b_l_e__t_r_i_a_n_g_l_e__t_i_p__ID*';
    this.double_triangle = `url(#${id})`;
    this.addMarker(defs, id, tri, 12, this.palette.node_rim);
    id = 'a_c_t_i_v_e__d_b_l__t_r_i__t_i_p__ID*';
    this.active_double_triangle = `url(#${id})`;
    this.addMarker(defs, id, tri, 12, this.palette.active_process);
    id = 'i_n_a_c_t_i_v_e__d_b_l__t_r_i__t_i_p__ID*';
    this.inactive_double_triangle = `url(#${id})`;
    this.addMarker(defs, id, tri, 12, 'silver');
    id = 'f_e_e_d_b_a_c_k__t_r_i_a_n_g_l_e__t_i_p__ID*';
    this.feedback_triangle = `url(#${id})`;
    this.addMarker(defs, id, fbt, 10, this.palette.node_rim);
    id = 'c_h_e_v_r_o_n__t_i_p__ID*';
    this.chevron = `url(#${id})`;
    this.addMarker(defs, id, chev, 8, this.palette.node_rim);
    id = 's_e_l_e_c_t_e_d__c_h_e_v_r_o_n__t_i_p__ID*';
    this.selected_chevron = `url(#${id})`;
    this.addMarker(defs, id, chev, 10, this.palette.select);
    id = 'c_o_n_n_e_c_t_i_n_g__c_h_e_v_r_o_n__t_i_p__ID*';
    this.connecting_chevron = `url(#${id})`;
    this.addMarker(defs, id, chev, 10, this.palette.active_rim);
    id = 'a_c_t_i_v_e__c_h_e_v_r_o_n__t_i_p__ID*';
    this.active_chevron = `url(#${id})`;
    this.addMarker(defs, id, chev, 7, this.palette.at_process_ub);
    id = 'b_l_a_c_k__c_h_e_v_r_o_n__t_i_p__ID*';
    this.black_chevron = `url(#${id})`;
    this.addMarker(defs, id, chev, 6, 'black');
    id = 'o_p_e_n__w_e_d_g_e__t_i_p__ID*';
    this.open_wedge = `url(#${id})`;
    this.addMarker(defs, id, wedge, 9, this.palette.node_rim);
    id = 's_e_l_e_c_t_e_d__o_p_e_n__w_e_d_g_e__t_i_p__ID*';
    this.selected_open_wedge = `url(#${id})`;
    this.addMarker(defs, id, wedge, 11, this.palette.select);
    id = 'r__b__g_r_a_d_i_e_n_t__ID*';
    this.red_blue_gradient = `url(#${id})`;
    this.addGradient(defs, id, 'rgb(255,176,176)', 'rgb(176,176,255)');
    id = 't_e_x_t__s_h_a_d_o_w__ID*';
    this.text_shadow_filter = `filter: url(#${id})`;
    this.addShadowFilter(defs, id, 'rgb(255,255,255)', 2);
    id = 'd_o_c_u_m_e_n_t_e_d__ID*';
    this.documented_filter = `filter: url(#${id})`;
    this.addShadowFilter(defs, id, 'rgb(50,120,255)', 2);
    id = 't_a_r_g_e_t__ID*';
    this.target_filter = `filter: url(#${id})`;
    this.addShadowFilter(defs, id, 'rgb(250,125,0)', 8);
    this.svg.appendChild(defs);
    this.changeFont(CONFIGURATION.default_font_name);
  }

  newSVGElement(type) {
    // Creates and returns a new SVG element of the specified type
    const el = document.createElementNS(this.svg_url, type);
    if(!el) throw UI.ERROR.CREATE_FAILED;
    // NOTE: by default, SVG elements should not respond to any mouse events!
    el.setAttribute('pointer-events', 'none');
    return el;
  }
  
  clearSVGElement(el) {
    // Clear all sub-nodes of the specified SVG node.
    if(el) while(el.lastChild) el.removeChild(el.lastChild);
  }
  
  addSVGAttributes(el, obj) {
    // Add attributes specified by `obj` to (SVG) element `el`.
    for(let prop in obj) {
      if(obj.hasOwnProperty(prop)) el.setAttribute(prop, obj[prop]);
    }
  }
  
  addMarker(defs, mid, mpath, msize, mcolor) {
    // Defines SVG for markers used to draw arrows and bound lines
    const marker = this.newSVGElement('marker');
    let shape = null;
    this.addSVGAttributes(marker,
        {id: mid, viewBox: '0,0 10,10', markerWidth: msize, markerHeight: msize,
            refX: 5, refY: 5, orient: 'auto-start-reverse',
            markerUnits: 'userSpaceOnUse', fill: mcolor});
    if(mpath == 'ellipse') {
      shape = this.newSVGElement('ellipse');
      this.addSVGAttributes(shape,
          {cx: 5, cy: 5, rx: 4, ry: 4, stroke: 'none'});
    } else {
      shape = this.newSVGElement('path');
      shape.setAttribute('d', mpath);
    }
    shape.setAttribute('stroke-linecap', 'round');
    marker.appendChild(shape);
    defs.appendChild(marker);
  }
  
  addGradient(defs, gid, color1, color2) {
    const gradient = this.newSVGElement('linearGradient');
    this.addSVGAttributes(gradient,
        {id: gid, x1: '0%', y1: '0%', x2: '100%', y2: '0%'});
    let stop = this.newSVGElement('stop');
    this.addSVGAttributes(stop,
        {offset: '0%', style: 'stop-color:' + color1 + ';stop-opacity:1'});
    gradient.appendChild(stop);
    stop = this.newSVGElement('stop');
    this.addSVGAttributes(stop,
        {offset: '100%', style:'stop-color:' + color2 + ';stop-opacity:1'});
    gradient.appendChild(stop);
    defs.appendChild(gradient);
  }
  
  addShadowFilter(defs, fid, color, radius) {
    // Defines SVG for filters used to highlight elements
    const filter = this.newSVGElement('filter');
    this.addSVGAttributes(filter, {id: fid, filterUnits: 'userSpaceOnUse'});
    const sub = this.newSVGElement('feDropShadow');
    this.addSVGAttributes(sub,
        {dx:0, dy:0, 'flood-color': color, 'stdDeviation': radius});
    filter.appendChild(sub);
    defs.appendChild(filter);
  }
  
  addShadowFilter2(defs, fid, color, radius) {
    // Defines SVG for more InkScape compatible filters used to highlight elements
    const filter = this.newSVGElement('filter');
    this.addSVGAttributes(filter, {id: fid, filterUnits: 'userSpaceOnUse'});
    let sub = this.newSVGElement('feGaussianBlur');
    this.addSVGAttributes(sub, {'in': 'SourceAlpha', 'stdDeviation': radius});
    filter.appendChild(sub);
    sub = this.newSVGElement('feOffset');
    this.addSVGAttributes(sub, {dx: 0, dy: 0, result: 'offsetblur'});
    filter.appendChild(sub);
    sub = this.newSVGElement('feFlood');
    this.addSVGAttributes(sub, {'flood-color': color, 'flood-opacity': 1});
    filter.appendChild(sub);
    sub = this.newSVGElement('feComposite');
    this.addSVGAttributes(sub, {in2: 'offsetblur', operator: 'in'});
    filter.appendChild(sub);
    const merge = this.newSVGElement('feMerge');
    sub = this.newSVGElement('feMergeNode');
    merge.appendChild(sub);
    sub = this.newSVGElement('feMergeNode');
    this.addSVGAttributes(sub, {'in': 'SourceGraphic'});
    merge.appendChild(sub);
    filter.appendChild(merge);
    defs.appendChild(filter);
  }
  
  changeFont(fn) {
    // For efficiency, this computes for all integer font sizes up to 16 the
    // height (in pixels) of a string, and also the relative font weight factors 
    // (relative to the normal font weight 400)
    this.font_name = fn;
    this.font_heights = [0];
    this.weight_factors = [0];
    // Get the SVG element used for text size computation
    const el = this.getSizingElement();
    // Set the (new) font name
    el.style.fontFamily = this.font_name;
    el.style.fontWeight = 400;
    // Calculate height and average widths for font sizes 1, 2, ... 16 px
    for(let i = 1; i <= 16; i++) {
      el.style.fontSize = i + 'px';
      // Use characters that probably affect height the most
      el.textContent = '[hq_|';
      this.font_heights.push(el.getBBox().height);
    }
    // Approximate how the font weight will impact string length relative
    // to normal. NOTE: only for 8px font, as this is the default size
    el.style.fontSize = '8px';
    // NOTE: Use a sample of most frequently used characters (digits!)
    // to estimate width change
    el.textContent = '0123456789%+-=<>.';
    const w400 = el.getBBox().width;
    for(let i = 1; i < 10; i++) {
      el.style.fontWeight = 100*i;
      this.weight_factors.push(el.getBBox().width / w400);
    }
  }

  numberSize(number, fsize=8, fweight=400) {
    // Returns the boundingbox {width: ..., height: ...} of a numeric
    // string (in pixels)
    // NOTE: this routine is about 500x faster than textSize because it
    // does not use the DOM tree
    // NOTE: using parseInt makes this function robust to font sizes passed
    // as strings (e.g., "10px")
    fsize = parseInt(fsize);
    // NOTE: 'number' may indeed be a number, so concatenate with '' to force
    // it to become a string
    const
        ns = '' + number,
        fh = this.font_heights[fsize],
        fw = fh / 2;
    let w = 0, m = 0;
    // Approximate the width of the Unicode characters representing
    // special values
    if(ns === '\u2047') {
      w = 8; // undefined (??)
    } else if(ns === '\u25A6' || ns === '\u2BBF' || ns === '\u26A0') {
      w = 6; // computing, not computed, warning sign
    } else {
      // Assume that number has been rendered with fixed spacing
      // (cf. addNumber method of class Shape)
      w = ns.length * fw;
      // Decimal point and minus sign are narrower
      if(ns.indexOf('.') >= 0) w -= 0.6 * fw;
      if(ns.startsWith('-')) w -= 0.55 * fw;
      // Add approximate extra length for =, % and special Unicode characters
      if(ns.indexOf('=') >= 0) {
        w += 0.2 * fw;
      } else {
        // LE, GE, undefined (??), or INF are a bit wider
        m = ns.match(/%|\u2264|\u2265|\u2047|\u221E/g);
        if(m) {
          w += m.length * 0.25 * fw;
        }
        // Ellipsis (may occur between process bounds) is much wider
        m = ns.match(/\u2026/g);
        if(m) w += m.length * 0.6 * fw;
      }
    }
    // adjust for font weight
    return {width: w * this.weight_factors[Math.round(fweight / 100)],
        height: fh};
  }
  
  textSize(string, fsize=8, fweight=400) {
    // Returns the boundingbox {width: ..., height: ...} of a string (in pixels) 
    // NOTE: uses the invisible SVG element that is defined specifically
    // for text size computation
    // NOTE: text size calculation tends to slightly underestimate the
    // length of the string as it is actually rendered, as font sizes
    // appear to be rounded to the nearest available size.
    const el = this.getSizingElement();
    // Accept numbers and strings as font sizes -- NOTE: fractions are ignored!
    el.style.fontSize = parseInt(fsize) + 'px';
    el.style.fontWeight = fweight;
    el.style.fontFamily = this.font_name;
    let w = 0,
        h = 0;
    // Consider the separate lines of the string
    const
        lines = ('' + string).split('\n'),  // Add '' in case string is a number
        ll = lines.length;
    for(let i = 0; i < ll; i++) {
      el.textContent = lines[i];
      const bb = el.getBBox();
      w = Math.max(w, bb.width);
      h += bb.height;
    }
    return {width: w, height: h};
  }
  
  removeInvisibleSVG() {
    // Removes SVG elements used by the user interface (not part of the model)
    let el = document.getElementById(this.size_box);
    if(el) this.svg.removeChild(el);
    el = document.getElementById(this.drag_line);
    if(el) this.svg.removeChild(el);
    el = document.getElementById(this.drag_rect);
    if(el) this.svg.removeChild(el);
  }

  getSizingElement() {
    // Returns the SVG sizing element, or creates it if not found
    let el = document.getElementById(this.size_box);
    // Create it if not found
    if(!el) {
      // Append an invisible text element to the SVG
      el = document.createElementNS(this.svg_url, 'text');
      if(!el) throw UI.ERROR.CREATE_FAILED;
      el.id = this.size_box;
      el.style.opacity = 0;
      this.svg.appendChild(el);
    }
    return el;
  }

  fitToSize(margin=30) {
    // Adjust the dimensions of the main SVG to fit the graph plus 15px margin
    // all around
    this.removeInvisibleSVG();
    const
        bb = this.svg.getBBox(),
        w = bb.width + margin,
        h = bb.height + margin;
    if(w !== this.width || h !== this.height) {
      MODEL.translateGraph(-bb.x + margin / 2, -bb.y + margin);
      this.width = w;
      this.height = h;
      this.svg.setAttribute('width', this.width);
      this.svg.setAttribute('height', this.height);
      this.zoom_factor = 1;
      this.zoom_label.innerHTML = Math.round(100 / this.zoom_factor) + '%';
      this.extend(margin);
    }
  }

  extend(margin=30) {
    // Adjust the paper size to fit all objects WITHOUT changing the origin (0, 0)
    // NOTE: keep a minimum page size to keep the scrolling more "natural"
    this.removeInvisibleSVG();
    const
        bb = this.svg.getBBox(),
        // Let `w` and `h` be the actual width and height in pixels
        w = bb.x + bb.width + margin,
        h = bb.y + bb.height + margin,
        // Let `ccw` and `cch` be the size of the scrollable area
        ccw = w / this.zoom_factor,
        cch = h / this.zoom_factor;
    if(this.zoom_factor >= 1) {
      this.width = w;
      this.height = h;
      this.svg.setAttribute('width', this.width);
      this.svg.setAttribute('height', this.height);
      // Reduce the image by making the view box larger than the paper
      const
          zw = w * this.zoom_factor,
          zh = h * this.zoom_factor;
      this.svg.setAttribute('viewBox', ['0 0', zw, zh].join(' '));
    } else {
      // Enlarge the image by making paper larger than the viewbox...
      this.svg.setAttribute('width', ccw / this.zoom_factor);
      this.svg.setAttribute('height', cch / this.zoom_factor);
      this.svg.setAttribute('viewBox', ['0 0', ccw, cch].join(' '));
    }
    // ... while making the scrollable area smaller (if ZF > 1)
    // c.q. larger (if ZF < 1)
    this.container.style.width = (this.width / this.zoom_factor) + 'px';
    this.container.style.height = (this.height / this.zoom_factor) + 'px';
  }
  
  //
  // ZOOM functionality
  //

  doZoom(z) {
    this.zoom_factor *= Math.sqrt(z);
    document.getElementById('zoom').innerHTML =
        Math.round(100 / this.zoom_factor) + '%';
    this.extend();
  }
  
  zoomIn() {
    if(UI.buttons.zoomin && !UI.buttons.zoomin.classList.contains('disab')) {
      // Enlarging graph by more than 200% would seem not functional
      if(this.zoom_factor > 0.55) this.doZoom(0.5);
    }
  }
  
  zoomOut() {
    if(UI.buttons.zoomout && !UI.buttons.zoomout.classList.contains('disab')) {
      // Reducing graph by to less than 25% would seem not functional
      if(this.zoom_factor <= 4) this.doZoom(2);
    }
  }
  
  cursorPosition(x, y) {
    // Returns [x, y] in diagram coordinates
    const
        rect = this.container.getBoundingClientRect(),
        top = rect.top + window.scrollY + document.body.scrollTop, 
        left = rect.left + window.scrollX + document.body.scrollLeft;
    x = Math.max(0, Math.floor((x - left) * this.zoom_factor));
    y = Math.max(0, Math.floor((y - top) * this.zoom_factor));
    return [x, y];
  }

  //
  // Metods for visual feedback while linking or selecting
  //

  dragLineToCursor(x1, y1, x2, y2) {
    // NOTE: does not remove element; only updates path and opacity
    let el = document.getElementById(this.drag_line);
    // Create it if not found
    if(!el) {
      el = this.newSVGElement('path');
      el.id = this.drag_line;
      el.style.opacity = 0;
      el.style.fill = 'none';
      el.style.stroke = UI.color.active_rim;
      el.style.strokeWidth = 1.5;
      el.style.strokeDasharray = UI.sda.dash;
      el.style.strokeLinecap = 'round';
      el.style.markerEnd = this.connecting_chevron;
      this.svg.appendChild(el);
    }
    const
        // Control points shoud make the curve stand out, so use 25% of
        // the Euclidean distance between the end points as "stretch".
        ed = 10 + Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)) / 4,
        // FROM control point should bend the curve around the FROM activity.
        fcx = x1 + ed,
        fcy = y1;
        // TO control point is endpoint, or depends on relative position
        // of the TO connector.
    let tcx = x2,
        tcy = y2;
    if(UI.to_connector && UI.to_activity) {
      const
          tasp = UI.to_connector.dataset.aspect,
          angle = 'ORPITC'.indexOf(tasp) * Math.PI / 3,
          tact = UI.to_activity,
          r = tact.width * 0.55 + ed;
      tcx = tact.x + Math.cos(angle) * r;
      tcy = tact.y + Math.sin(angle) * r;
    }
    el.setAttribute('d',
        `M${x1},${y1}C${fcx},${fcy},${tcx},${tcy},${x2},${y2}`);
    el.style.opacity = 1;
    this.adjustPaperSize(x2, y2);
  }
  
  adjustPaperSize(x, y) {
    if(this.zoom_factor < 1) return;
    const
        w = parseFloat(this.svg.getAttribute('width')),
        h = parseFloat(this.svg.getAttribute('height'));
    if(x <= w && y <= h) return;
    if(x > w) {
      this.svg.setAttribute('width', x);
      this.width = x;
      this.container.style.width = (x / this.zoom_factor) + 'px';
    }
    if(y > h) {
      this.svg.setAttribute('height', y);
      this.height = y;
      this.container.style.height = (y / this.zoom_factor) + 'px';
    }
    this.svg.setAttribute('viewBox',
        ['0 0', this.width * this.zoom_factor,
            this.height * this.zoom_factor].join(' '));
  }
  
  hideDragLine() {
    const el = document.getElementById(this.drag_line);
    if(el) el.style.opacity = 0;
  }

  dragRectToCursor(ox, oy, dx, dy) {
    // NOTE: does not remove element; only updates path and opacity
    let el = document.getElementById(this.drag_rect);
    // Create it if not found
    if(!el) {
      el = this.newSVGElement('rect');
      el.id = this.drag_rect;
      el.style.opacity = 0;
      el.style.fill = 'none';
      el.style.stroke = 'red';
      el.style.strokeWidth = 1.5;
      el.style.strokeDasharray = UI.sda.dash;
      el.setAttribute('rx', 0);
      el.setAttribute('ry', 0);
      this.svg.appendChild(el);
    }
    let lx = Math.min(ox, dx),
        ty = Math.min(oy, dy),
        rx = Math.max(ox, dx),
        by = Math.max(oy, dy);
    el.setAttribute('x', lx);
    el.setAttribute('y', ty);
    el.setAttribute('width', rx - lx);
    el.setAttribute('height', by - ty);
    el.style.opacity = 1;
    this.adjustPaperSize(rx, by);
  }
  
  hideDragRect() {
    const el = document.getElementById(this.drag_rect);
    if(el) { el.style.opacity = 0; }
  }
  
  //
  //  Auxiliary methods used while drawing shapes
  //
  
  arc(r, srad, erad) {
    // Returns SVG path code for an arc having radius `r`, start angle `srad`,
    // and end angle `erad`
    return 'a' + [r, r, 0, 0, 1, r * Math.cos(erad) - r * Math.cos(srad),
        r * Math.sin(erad) - r * Math.sin(srad)].join(',');
  }

  bezierPoint(a, b, c, d, t) {
    // Returns the point on a cubic Bezier curve from `a` to `d` with control
    // points `b` and `c`, and `t` indicating the relative distance from `a`
    // as a fraction between 0 and 1. NOTE: the four points must be represented
    // as lists [x, y]
    function interPoint(a, b, t) {
      // Local function that performs linear interpolation between two points
      // `a` = [x1, y1] and `b` = [x2, y2] when parameter `t` indicates
      // the relative distance from `a` as a fraction between 0 and 1
      return  [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    }
    // Calculate the Bezier points
    const ab = interPoint(a, b, t),
          bc = interPoint(b, c, t),
          cd = interPoint(c, d, t);
    return interPoint(interPoint(ab, bc, t), interPoint(bc, cd, t), t);
  }

  relDif(n1, n2) {
    // Returns the relative difference (n1 - n2) / |n2| unless n2 is
    // near-zero; then it returns the absolute difference n1 - n2
    const div = Math.abs(n2);
    if(div < VM.NEAR_ZERO) {
      return n1 - n2;
    }
    return (n1 - n2) / div;
  }
  
  //
  // Diagram-drawing method draws the diagram for the focal cluster
  //
  
  drawModel(mdl) {
    // Draw the diagram for the focal cluster.
    this.clear();
    // Prepare to draw all elements in the focal cluster.
    const
        fa = mdl.focal_activity,
        vl = fa.visibleLinks;
    for(let i = 0; i < fa.sub_activities.length; i++) {
      fa.sub_activities[i].clearHiddenIO();
      this.drawActivity(fa.sub_activities[i]);
    }
    for(let i = 0; i < vl.length; i++) {
      this.drawLink(vl[i]);
    }
    // Draw notes last, as they are semi-transparent, and can be quite small.
    for(let i = 0; i < fa.notes.length; i++) {
      this.drawNote(fa.notes[i]);
    }
    // Resize paper if necessary.
    this.extend();
    // Display model name in browser.
    document.title = mdl.name || 'diaFRAM';
  }
  
  drawSelection(mdl, dx=0, dy=0) {
    // NOTE: Clear this global, as Bezier curves move from under the cursor.
    // without a mouseout event.
    this.link_under_cursor = null;
        // Draw the selected entities and associated links.
    for(let i = 0; i < mdl.selection.length; i++) {
      const obj = mdl.selection[i];
      // Links are drawn separately, so do not draw those contained in
      // the selection .
      if(!(obj instanceof Link)) {
        UI.drawObject(obj, dx, dy);
      }
    }
    // Redraw all links that are visible in the focal activity.
    const vl = mdl.focal_activity.visibleLinks;
    for(let i = 0; i < vl.length; i++) {
      this.drawLink(vl[i]);
    }
    this.extend(); 
  }

  drawLink(l) {
    // Draws link `l` on the paper.
    let stroke_color,
        stroke_width,
        chev,
        ady;
    // Clear previous drawing.
    l.shape.clear();
    const
        vn = l.visibleNodes,
        // Link is dashed when it has no assiciated aspects.
        sda = (l.aspects.length ? 'none' : UI.sda.dash);
    // Double-check: do not draw unless both activities are visible.
    if(!vn[0] || !vn[1]) return;
    if(l.selected) {
      // Draw arrow line thick and in red.
      stroke_color = this.palette.select;
      stroke_width = 1.75;
      chev = this.selected_chevron;
      ady = 4;
    } else {
      stroke_color = this.palette.node_rim;
      stroke_width = 1.25;
      chev = this.chevron;
      ady = 3;
    }
    const
        fa = l.from_activity,
        ta = l.to_activity,
        tc = l.to_connector,
        angle = 'ORPITC'.indexOf(tc) * Math.PI / 3,
        x1 = fa.x + fa.width * 0.55 + 7,
        y1 = fa.y,
        r = ta.width * 0.55 + 11,
        x2 = ta.x + Math.cos(angle) * r,
        y2 = ta.y + Math.sin(angle) * r,
        // Control points should make the curve stand out, so use 25% of
        // the Euclidean distance between the end points as "stretch".
        ed = 10 + Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)) / 8,
        // FROM control point should bend the curve around the FROM activity.
        fcx = x1 + ed,
        fcy = y1,
        tcx = x2 + Math.cos(angle) * ed,
        tcy = y2 + Math.sin(angle) * ed;
    // First draw a thick but near-transparent line so that the mouse
    // events is triggered sooner.
    const le = l.shape.addPath(
        [`M${x1},${y1}C${fcx},${fcy},${tcx},${tcy},${x2},${y2}`],
        {fill: 'none', stroke: 'white', 'stroke-width': 9,
            'stroke-linecap': 'round', opacity: 0.01});
      le.setAttribute('pointer-events', 'auto');
      le.addEventListener('mouseover',
          () => { UI.setLinkUnderCursor(l); });
      le.addEventListener('mouseout',
          () => { UI.setLinkUnderCursor(null); });
    // Then draw the line in its appropriate style.
    l.shape.addPath(
        [`M${x1},${y1}C${fcx},${fcy},${tcx},${tcy},${x2},${y2}`],
        {fill: 'none', stroke: stroke_color, 'stroke-width': stroke_width,
            'stroke-dasharray': sda, 'stroke-linecap': 'round',
            'marker-end': chev, opacity: 1});
    if(l.aspects.length) {
      const
          sauc = (event) => { UI.setAspectUnderCursor(event); },
          cauc = () => { UI.clearAspectUnderCursor(); },
          n = l.aspects.length,
          step = 0.4 / n;
      let p = 0.5 - (n - 1) * step;
      for(let i = 0; i < n; i++) {
        const
            a = l.aspects[i],
            aid = a.identifier,
            bp = this.bezierPoint(
                [x1, y1], [fcx, fcy], [tcx, tcy], [x2, y2], p),
            le = l.shape.addText(bp[0], bp[1], a.name_lines,
                {'font-size': 9, 'pointer-events': 'auto'}),
            nimbus = (a.comments && DOCUMENTATION_MANAGER.visible ?
                ', 0 0 3.5px rgb(0,80,255)' : '');
        le.setAttribute('style',
            'text-shadow: 0.5px 0.5px white, -0.5px -0.5px white, ' +
                '0.5px -0.5px white, -0.5px 0.5px white' + nimbus);
        // Add identifying data attribute.
        le.setAttribute('data-id', aid);
        // Add identifying data attribute.
        le.setAttribute('data-id', aid);
        // Make aspect text responsive to cursor events...
        le.setAttribute('pointer-events', 'auto');
        le.addEventListener('mouseover', sauc);
        le.addEventListener('mouseout', cauc);
        // ... and make it show this by changing the cursor.
        le.setAttribute('cursor', 'pointer');
        if(MODEL.solved && a.expression.defined) {
          const
              r = a.expression.result(MODEL.t),
              s = VM.sig4Dig(r),
              nbb = this.numberSize(s, 9),
              bw = nbb.width + 4,
              bh = nbb.height + 2,
              bx = bp[0] + (a.width + bw) / 2,
              by = bp[1];
          l.shape.addRect(bx, by, bw, bh,
              {stroke: '#80a0ff', 'stroke-width': 0.5, fill: '#d0f0ff'});
          if(Math.abs(r) >= -VM.ERROR) {
            l.shape.addNumber(bx, by, s,
                {'font-size': 9, 'fill': this.palette.VM_error});
          } else {
            l.shape.addNumber(bx, by, s,
                {'font-size': 9, 'fill': '#0000a0', 'font-weight': 700});
          }
        }
        p += 2 * step;
      }
    }
    // Highlight shape if it has comments.
    l.shape.element.setAttribute('style',
        (DOCUMENTATION_MANAGER.visible && l.comments ?
            this.documented_filter : ''));
    l.shape.appendToDOM();
  }

  drawActivity(act, dx=0, dy=0) {
    // Clear previous drawing.
    act.shape.clear();
    // Do not draw process unless in focal activity.
    if(MODEL.focal_activity.sub_activities.indexOf(act) < 0) return;
    // Set local constants and variables.
    const
        x = act.x + dx,
        y = act.y + dy,
        hw = act.width / 2,
        hh = act.height / 2,
        qw = hw / 2;
    let stroke_width = 1,
        stroke_color = this.palette.node_rim,
        fill_color = this.palette.node_fill;
    // Being selected overrules special border properties except SDA
    if(act.selected) {
      stroke_color = this.palette.select;
      stroke_width = 2;
    }
    // Draw frame using colors as defined above.
    act.shape.addPath(['M', x - hw, ',', y, 'l', qw, ',-', hh,
        'l', hw, ',0l', qw, ',', hh, 'l-', qw, ',', hh, 'l-', hw, ',0Z'],
        {fill: fill_color, stroke: stroke_color,
            'stroke-width': stroke_width});
    // Draw inner shadow if activity has sub_activities.
    if(act.sub_activities.length) {
      act.shape.addPath(['M', x - (hw-2.5), ',', y, 'l', (qw-1), ',-', (hh-2),
          'l', (hw-2.5), ',0l', (qw-1), ',', (hh-2), 'l-', (qw-1), ',', (hh-2),
          'l-', (hw-2.5), ',0Z'],
              {fill: 'none', stroke: stroke_color, 'stroke-width': 5,
                  opacity: 0.4});
    }
    // Add the six aspect circles.
    const
        letters = 'ORPITC',
        aid = act.identifier;
    for(let i = 0; i < 6; i++) {
      const
          a = Math.PI * i / 3,
          ax = x + Math.cos(a) * hw * 1.1,
          ay = y + Math.sin(a) * hw * 1.1;
      act.shape.addConnector(ax, ay, letters.charAt(i), aid);
    }
    // Always draw process name plus actor name (if any).
    const
        th = act.name_lines.split('\n').length * this.font_heights[10] / 2,
        cy = (act.hasActor ? y - 8 : y - 2);
    act.shape.addText(x, cy, act.name_lines, {'font-size': 10});
    if(act.hasActor) {
      act.shape.addText(x, cy + th + 6, act.actor.name,
          {'font-size': 10, fill: this.palette.actor_font,
              'font-style': 'italic'});
    }
    if(MODEL.show_block_arrows) {
      // Add block arrows for hidden input and output links.
      act.shape.addBlockArrow(x - hw + 3, y - hh + 17, UI.BLOCK_IN,
          act.hidden_inputs.length);
      act.shape.addBlockArrow(x + hw - 4, y - hh + 17, UI.BLOCK_OUT,
          act.hidden_outputs.length);
    }
    // Highlight shape if needed.
    let filter = '';
    if(act === UI.target_activity) {
      filter = this.target_filter;
    } else if(DOCUMENTATION_MANAGER.visible && act.comments) {
      filter = this.documented_filter;
    }
    act.shape.element.firstChild.setAttribute('style', filter);
    // Make shape slightly transparent.
    act.shape.element.setAttribute('opacity', 0.9);
    act.shape.appendToDOM();    
  }
  
  drawNote(note, dx=0, dy=0) {
    // NOTE: call resize if text contains fields, as text determines size
    note.resize();
    const
        x = note.x + dx,
        y = note.y + dy,
        w = note.width,
        h = note.height;
    let stroke_color, stroke_width;
    if(note.selected) {
      stroke_color = this.palette.select;
      stroke_width = 1.6;
    } else {
      stroke_color = this.palette.note_rim;
      stroke_width = 0.6;
    }
    note.shape.clear();
    note.shape.addRect(x, y, w, h,
        {fill: this.palette.note_fill, opacity: 0.75, stroke: stroke_color,
            'stroke-width': stroke_width, rx: 4, ry: 4});
    note.shape.addRect(x, y, w-2, h-2,
        {fill: 'none', stroke: this.palette.note_band, 'stroke-width': 1.5,
            rx: 3, ry: 3});
    note.shape.addText(x - w/2 + 4, y, note.lines,
        {fill: this.palette.note_font, 'text-anchor': 'start'});
    note.shape.appendToDOM();
  }
  
} // END of class Paper
