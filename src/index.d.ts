/**
 * A chart dimension, given either in pixels or as a percentage of the
 * container (e.g., `'50%'`).
 */
export type FunnelDimension = number | `${number}%`;

/**
 * The block colors, given either as a list of colors indexed by block or as a
 * function that receives the block index (such as a D3 ordinal scale).
 */
export type FunnelColors = readonly string[] | ((index: number) => string);

/**
 * A custom label or tooltip formatter.
 */
export type FunnelFormatFunction = (
    label: string,
    value: number,
    formattedValue: FunnelDatum['formattedValue'] | null,
) => string;

/**
 * Either a format function or a format string, in which `{l}` is replaced
 * with the label, `{v}` with the raw value, and `{f}` with the formatted value.
 */
export type FunnelFormat = string | FunnelFormatFunction;

/**
 * A data entry for a single block of the funnel. Additional properties may be
 * attached and are accessible in event handlers through `data`.
 */
export interface FunnelDatum {
    /** The label to associate with the block. */
    label: string;
    /** The value (or count) to associate with the block. */
    value: number;
    /** A block-level override for `block.fill.colors`. Hex only. */
    fillColor?: string;
    /** A block-level override of the `{f}` formatted value. */
    formattedValue?: string | number;
    /** Whether to hide the formatted label for this block. */
    hideLabel?: boolean;
    /** A block-level override for `label.color`. Hex only. */
    labelColor?: string;
    /** A block-level override for `label.fontSize`. */
    labelFontSize?: string;
    /** A block-level override for `label.fontFamily`. */
    labelFontFamily?: string;
}

/**
 * The block information passed to event handlers.
 */
export interface FunnelBlock<TDatum extends FunnelDatum = FunnelDatum> {
    /** The index of the block. */
    index: number;
    /** The block's original data entry. */
    data: TDatum;
    /** The DOM node of the block. */
    node: SVGPathElement;
    /** The ratio of the block's value to the total value. */
    ratio: number;
    /** The numerical value. */
    value: number;
    /** The pixel height of the block. */
    height: number;
    fill: {
        /** The hex background color. */
        raw: string;
        /** The applied fill, which is a gradient URL for gradient fills. */
        actual: string;
    };
    label: {
        enabled: boolean;
        /** The unformatted label. */
        raw: string;
        /** The result of `label.format`. */
        formatted: string;
        /** The label color. */
        color: string;
        /** The label font size. */
        fontSize: string;
        /** The label font family. */
        fontFamily: string | null;
    };
    tooltip: {
        /** The result of `tooltip.format`. */
        formatted: string;
    };
}

/**
 * A block event handler. `this` is bound to the block's path element.
 */
export type FunnelBlockEventHandler<TDatum extends FunnelDatum = FunnelDatum> = (
    this: SVGPathElement,
    event: MouseEvent,
    data: FunnelBlock<TDatum>,
) => void;

/**
 * The complete chart settings, as held by `D3Funnel.defaults`.
 */
export interface FunnelSettings<TDatum extends FunnelDatum = FunnelDatum> {
    chart: {
        /** The width of the chart in pixels or a percentage. */
        width: FunnelDimension;
        /** The height of the chart in pixels or a percentage. */
        height: FunnelDimension;
        /** The width of the funnel's neck (its narrow end, at the top when inverted), as a fraction of the chart's width. */
        neckWidth: number;
        /** How many blocks at the neck keep its width. */
        pinchedBlocks: number;
        /** Whether the funnel direction is inverted (like a pyramid). */
        inverted: boolean;
        animation: {
            /** The duration of each block's load animation in milliseconds; `0` disables it. */
            duration: number;
        };
        curve: {
            /** Whether the funnel is curved. */
            enabled: boolean;
            /** The curvature amount. Narrower edges curve proportionally less. */
            depth: number;
            /** The shade adjustment of the top oval, from `-1` to `1`. */
            shade: number;
        };
        /** Override the total value used in ratio calculations. */
        totalValue: number | null;
    };
    block: {
        /** Whether the block heights are proportional to their value. */
        proportionalHeight: boolean;
        /** Whether the block widths narrow in proportion to their value decrease. */
        proportionalWidth: boolean;
        barOverlay: {
            /** Whether the blocks have bar chart overlays proportional to their weight. */
            enabled: boolean;
            /** The shade adjustment of the block behind its overlay, from `-1` to `1`. */
            shade: number;
        };
        fill: {
            /** The block colors. */
            colors: FunnelColors;
            /** The fill type of the blocks. */
            type: 'solid' | 'gradient';
            /** The shade adjustment of the edges of gradient fills, from `-1` to `1`. */
            gradientShade: number;
        };
        /** The minimum pixel height of a block. */
        minHeight: number;
        /** The pixel space between blocks. The funnel's outline is preserved. */
        gap: number;
        highlight: {
            /** Whether the blocks are highlighted on hover. */
            enabled: boolean;
            /** The shade adjustment of a highlighted block, from `-1` to `1`. */
            shade: number;
            /** The shade adjustment of a highlighted overlay, from `-1` to `1`. */
            overlayShade: number;
        };
    };
    label: {
        /** Whether the block labels should be displayed. */
        enabled: boolean;
        /** Any valid font family for the labels. */
        fontFamily: string | null;
        /** Any valid font size for the labels. */
        fontSize: string;
        /** The height of each line of a label, as a multiple of its font size. */
        lineHeight: number;
        /** Any valid hex color for the labels. */
        color: string;
        /** The label format. */
        format: FunnelFormat;
        /** Where to place labels within their blocks. */
        verticalAlign: 'top' | 'middle' | 'bottom';
        /** Whether to truncate labels wider than their blocks with an ellipsis. */
        overflow: 'visible' | 'ellipsis';
        /** The pixel padding between a label and the edges of its block. */
        padding: number;
    };
    tooltip: {
        /** Whether tooltips should be enabled on hover. */
        enabled: boolean;
        /** The tooltip format. */
        format: FunnelFormat;
        /** The pixel distance between the tooltip and the mouse. */
        offset: number;
        /**
         * CSS properties applied to the tooltip, keyed by their CSS names. The
         * border color defaults to the block's color.
         */
        style: Record<string, string | null>;
    };
    events: {
        click: {
            /** Called when a block is clicked. */
            block: FunnelBlockEventHandler<TDatum> | null;
        };
        mouseover: {
            /** Called when the mouse enters a block. */
            block: FunnelBlockEventHandler<TDatum> | null;
        };
        mouseout: {
            /** Called when the mouse leaves a block. */
            block: FunnelBlockEventHandler<TDatum> | null;
        };
    };
}

type DeepPartial<T> = T extends (...args: never[]) => unknown ? T :
    T extends readonly unknown[] ? T :
        T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } :
            T;

/**
 * The options accepted by `D3Funnel.draw()`, which override the defaults.
 */
export type FunnelOptions<TDatum extends FunnelDatum = FunnelDatum> = DeepPartial<FunnelSettings<TDatum>>;

declare class D3Funnel {
    /** The default settings used by every chart. */
    static defaults: FunnelSettings;

    /**
     * @param selector A selector for, or reference to, the container element.
     */
    constructor(selector: string | Element);

    /**
     * Draw the chart inside the container with the data and configuration
     * specified. This will remove any previous SVG elements in the container
     * and draw a new funnel chart on top of it.
     *
     * @param data    A list of blocks, each containing a label and a value.
     * @param options An optional configuration object to override defaults.
     */
    draw<TDatum extends FunnelDatum>(data: readonly TDatum[], options?: FunnelOptions<TDatum>): void;

    /**
     * Redraw the label of a single block, replacing its current label. The
     * overrides apply only to this drawing, so calling this again without them
     * restores the block's original label.
     *
     * @param index     The index of the block.
     * @param overrides Label properties to use in place of the block's own.
     */
    drawLabel(index: number, overrides?: Partial<Pick<FunnelBlock['label'], 'color' | 'fontSize' | 'fontFamily'>>): void;

    /**
     * Remove the funnel and its events from the DOM.
     */
    destroy(): void;
}

export default D3Funnel;
