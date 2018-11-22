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
    parentWidth: PropTypes.number,
    parentHeight: PropTypes.number,
  }

  static defaultProps = {
    page: 1,
    onDocumentComplete: null,
    scale: 1,
    fillWidth: false,
    fillHeight: false,
    parentWidth: 1,
    parentHeight: 1,
  }

  state = {
    pdf: null,
  };

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

  calculateScale = (scale, fillWidth, fillHeight, view, parentWidth, parentHeight) => {
    if (fillWidth) {
      const pageWidth = view[2] - view[0];
      return parentWidth / pageWidth;
    }
    if (fillHeight) {
      const pageHeight = view[3] - view[1];
      return parentHeight / pageHeight;
    }
    return scale;
  }

  drawPDF = (page) => {
    const {
      scale: pScale,
      fillHeight,
      fillWidth,
      parentWidth,
      parentHeight,
    } = this.props;
    const { canvas } = this;

    const canvasContext = canvas.getContext('2d');
    const dpiScale = window.devicePixelRatio || 1;
    const scale = this.calculateScale(pScale, fillWidth, fillHeight, page.view, parentWidth, parentHeight);
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
    const { className } = this.props;
    return <canvas ref={(canvas) => { this.canvas = canvas; }} className={className} />;
  }
}
