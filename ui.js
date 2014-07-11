// Generated by CoffeeScript 1.7.1
var App, DownloadLinks, DownloadView, FileView, Selector, a, button, div, form, h1, input, p, rect, svg, _ref;

_ref = React.DOM, div = _ref.div, form = _ref.form, input = _ref.input, p = _ref.p, h1 = _ref.h1, a = _ref.a, button = _ref.button, svg = _ref.svg, rect = _ref.rect;

App = React.createClass({
  getInitialState: function() {
    return {
      xml: null,
      cutoff: null,
      updateCutoff: this.updateCutoff
    };
  },
  handleFile: function(e) {
    var reader;
    reader = new FileReader();
    reader.onload = (function(_this) {
      return function(evt) {
        var parser, xml;
        parser = new DOMParser();
        xml = parser.parseFromString(evt.target.result, 'text/xml');
        return _this.setState({
          xml: xml
        });
      };
    })(this);
    return reader.readAsText(e.target.files[0]);
  },
  updateCutoff: function(newCutoff) {
    return this.setState({
      cutoff: newCutoff
    });
  },
  render: function() {
    return div({}, [
      h1({}, "Strava Split"), this.state.xml == null ? p({}, "Upload a gpx file") : null, this.state.xml == null ? form({}, input({
        type: 'file',
        onChange: this.handleFile
      })) : null, this.state.xml != null ? FileView(this.state) : null, this.state.cutoff != null ? DownloadView(this.state) : null
    ]);
  }
});

FileView = React.createClass({
  render: function() {
    var allpoints, bars, barwidth, end, h, i, name, start, _i, _ref1;
    name = this.props.xml.querySelector('name').innerHTML;
    start = Date.parse(this.props.xml.querySelector('trkseg trkpt:first-child time').innerHTML);
    end = Date.parse(this.props.xml.querySelector('trkseg trkpt:last-child time').innerHTML);
    bars = [];
    allpoints = this.props.xml.getElementsByTagName('ele');
    barwidth = 600 / allpoints.length;
    for (i = _i = 0, _ref1 = allpoints.length - 1; 0 <= _ref1 ? _i <= _ref1 : _i >= _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
      h = allpoints[i].innerHTML;
      bars.push(rect({
        height: h,
        width: barwidth,
        x: i * barwidth,
        y: 100 - h,
        fill: 'black',
        stroke: 'none'
      }));
    }
    return div({
      className: 'fileView'
    }, [
      h1({}, name), svg({
        height: 100,
        width: 600
      }, bars), p({}, start + " to " + end), Selector({
        start: start,
        end: end,
        cutoff: this.props.cutoff,
        updateCutoff: this.props.updateCutoff
      })
    ]);
  }
});

Selector = React.createClass({
  getInitialState: function() {
    return {
      value: (this.props.start + this.props.end) / 2
    };
  },
  handleChange: function() {
    var val;
    val = this.refs.slider.getDOMNode().value;
    return this.props.updateCutoff(val);
  },
  render: function() {
    return input({
      type: 'range',
      min: this.props.start,
      max: this.props.end,
      defaultValue: this.props.cutoff,
      ref: 'slider',
      onChange: this.handleChange
    });
  }
});

DownloadView = React.createClass({
  getInitialState: function() {
    return {
      computed: null
    };
  },
  handleClick: function() {
    return this.setState({
      computed: this.props.cutoff
    });
  },
  render: function() {
    return div({
      className: 'downloadView',
      ref: 'container'
    }, this.state.computed === this.props.cutoff ? DownloadLinks(this.props) : button({
      onClick: this.handleClick
    }, "Split"));
  }
});

DownloadLinks = React.createClass({
  render: function() {
    var firstTime, href1, href2, newXMLString1, newXMLString2, serializer, xml1, xml2;
    xml1 = this.props.xml;
    xml2 = xml1.cloneNode(true);
    [].forEach.call(xml1.querySelectorAll('trkseg time'), (function(_this) {
      return function(t) {
        if (Date.parse(t.innerHTML) >= _this.props.cutoff) {
          return t.parentNode.remove();
        }
      };
    })(this));
    xml1.querySelector('trk name').innerHTML += " (part 1)";
    [].forEach.call(xml2.querySelectorAll('trkseg time'), (function(_this) {
      return function(t) {
        if (Date.parse(t.innerHTML) < _this.props.cutoff) {
          return t.parentNode.remove();
        }
      };
    })(this));
    xml2.querySelector('trk name').innerHTML += " (part 2)";
    firstTime = xml2.querySelector('trk time').innerHTML;
    xml2.querySelector('metadata time').innerHTML = firstTime;
    serializer = new XMLSerializer();
    newXMLString1 = serializer.serializeToString(xml1);
    href1 = "data:application/gpx+xml;base64," + btoa(newXMLString1);
    newXMLString2 = serializer.serializeToString(xml2);
    newXMLString2 = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + newXMLString2;
    href2 = "data:application/gpx+xml;base64," + btoa(newXMLString2);
    return div({}, [
      p({}, "Right click and select 'Save link as'"), a({
        href: href1
      }, "Download Part 1"), a({
        href: href2
      }, "Download Part 2")
    ]);
  }
});
