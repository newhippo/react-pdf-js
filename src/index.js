/**
 * @class ReactPdfJs
 */
import PdfJsLib from 'pdfjs-dist';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default class ReactPdfJs extends Component {
  static propTypes = {
    file: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
    ]).isRequired,
    page: PropTypes.number,
    onDocumentComplete: PropTypes.func,
    scale: PropTypes.number,
    fillWidth: PropTypes.bool,
    fillHeight: PropTypes.bool,
    loading: PropTypes.node,
    className: PropTypes.string,
  }

  static defaultProps = {
    page: 1,
    onDocumentComplete: null,
    scale: 1,
    fillWidth: false,
    fillHeight: false,
    loading: 'Loading PDF...',
    className: undefined,
  }

  state = {
    pdf: null,
  };

  wrapper = React.createRef();

  canvas = React.createRef();

  componentDidMount() {
    const {
      file,
      onDocumentComplete,
      page,
    } = this.props;
    PdfJsLib.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.0.943/pdf.worker.js';
    PdfJsLib.getDocument(file).then((pdf) => {
      this.setState({ pdf });
      if (onDocumentComplete) {
        onDocumentComplete(pdf._pdfInfo.numPages); // eslint-disable-line
      }
      pdf.getPage(page).then(p => this.drawPDF(p));
    });
  }

  componentDidUpdate(prevProps) {
    const { page: oldPage, scale: oldScale } = prevProps;
    const { page, scale } = this.props;
    const { pdf } = this.state;

    if (scale !== oldScale || page !== oldPage) {
      pdf.getPage(page).then(p => this.drawPDF(p));
    }
  }

  calculateScale = (view) => {
    const { scale, fillWidth, fillHeight } = this.props;

    if (fillWidth) {
      const pageWidth = view[2] - view[0];
      return this.wrapper.current.clientWidth / pageWidth;
    }
    if (fillHeight) {
      const pageHeight = view[3] - view[1];
      return this.wrapper.current.clientHeight / pageHeight;
    }
    return scale;
  }

  drawPDF = (page) => {
    const canvas = this.canvas.current;

    const canvasContext = canvas.getContext('2d');
    const dpiScale = window.devicePixelRatio || 1;
    const scale = this.calculateScale(page.view);
    const adjustedScale = scale * dpiScale;
    const viewport = page.getViewport(adjustedScale);
    canvas.style.width = `${viewport.width / dpiScale}px`;
    canvas.style.height = `${viewport.height / dpiScale}px`;
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    page.render({
      canvasContext,
      viewport,
    });
  }

  render() {
    const { className, loading } = this.props;
    const { pdf } = this.state;
    if (loading && !pdf) {
      return loading;
    }
    return <div ref={this.wrapper}><canvas ref={this.canvas} className={className} /></div>;
  }
}
