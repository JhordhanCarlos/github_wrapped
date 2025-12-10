declare module "html2canvas" {
  interface Html2CanvasOptions {
    backgroundColor?: string;
    scale?: number;
    logging?: boolean;
    useCORS?: boolean;
    width?: number;
    height?: number;
  }

  function html2canvas(
    element: HTMLElement,
    options?: Html2CanvasOptions
  ): Promise<HTMLCanvasElement>;

  export default html2canvas;
}

