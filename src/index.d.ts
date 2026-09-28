/**
 * A chart dimension, given either in pixels or as a percentage of the
 * container (e.g., `'50%'`).
 */
export type FunnelDimension = number | `${number}%`;

/**
 * A color scale, given either as a list of colors indexed by block or as a
 * function that receives the block index (such as a D3 ordinal scale).
 */
export type FunnelColorScale = readonly string[] | ((index: number) => string);

/**
 * A custom label or tooltip formatter.
 */
export type FunnelFormatFunction = (
    label: string,
    value: number,
    formattedValue: FunnelDatumObject['formattedValue'] | null,
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
export interface FunnelDatumObject {
    /** The label to associate with the block. */
    label: string;
    /** The value (or count) to associate with the block. */
    value: number;
    /** A block-level override for `block.fill.scale`. Hex only. */
    backgroundColor?: string;
    /** A block-level override of the `{f}` formatted value. */
    formattedValue?: string | number;
    /** Whether to hide the formatted label for this block. */
    hideLabel?: boolean;
    /** A block-level override for `label.fill`. Hex only. */
    labelColor?: string;
}

/**
 * The legacy array format of a data entry:
 * `[label, value | [value, formattedValue], backgroundColor?, labelColor?]`.
 */
export type FunnelDatumArray = readonly [
    label: string,
    value: number | readonly [value: number, formattedValue: string | number],
    backgroundColor?: string,
    labelColor?: string,
];

export type FunnelDatum = FunnelDatumObject | FunnelDatumArray;

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
    /** The ratio of the block's value to the total count. */
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
    };
    tooltip: {
        enabled: boolean | undefined;
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
        /** The percent of total width the bottom should be. */
        bottomWidth: number;
        /** How many blocks to pinch on the bottom to create a funnel "neck". */
        bottomPinch: number;
        /** Whether the funnel direction is inverted (like a pyramid). */
        inverted: boolean;
        /** The load animation speed in milliseconds; `0` disables it. */
        animate: number;
        curve: {
            /** Whether the funnel is curved. */
            enabled: boolean;
            /** The curvature amount. Narrower edges curve proportionally less. */
            height: number;
            /** The shade adjustment of the top oval, from `-1` to `1`. */
            shade: number;
        };
        /** Override the total count used in ratio calculations. */
        totalCount: number | null;
    };
    block: {
        /** Whether the block heights are proportional to their weight. */
        dynamicHeight: boolean;
        /** Whether the block widths are proportional to their value decrease. */
        dynamicSlope: boolean;
        /** Whether the blocks have bar chart overlays proportional to their weight. */
        barOverlay: boolean;
        fill: {
            /** The background color scale. */
            scale: FunnelColorScale;
            /** The fill type of the blocks. */
            type: 'solid' | 'gradient';
        };
        /** The minimum pixel height of a block. */
        minHeight: number;
        /** The pixel space between blocks. The funnel's outline is preserved. */
        gap: number;
        /** Whether the blocks are highlighted on hover. */
        highlight: boolean;
    };
    label: {
        /** Whether the block labels should be displayed. */
        enabled: boolean;
        /** Any valid font family for the labels. */
        fontFamily: string | null;
        /** Any valid font size for the labels. */
        fontSize: string;
        /** Any valid hex color for the label color. */
        fill: string;
        /** The label format. */
        format: FunnelFormat;
        /** Where to place labels within their blocks. */
        verticalAlign: 'top' | 'middle' | 'bottom';
        /** Whether to truncate labels wider than their blocks with an ellipsis. */
        overflow: 'visible' | 'ellipsis';
    };
    tooltip: {
        /** Whether tooltips should be enabled on hover. */
        enabled: boolean;
        /** The tooltip format. */
        format: FunnelFormat;
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
    /** The pixel height of each line of a label. */
    static LABEL_LINE_HEIGHT: number;

    /** The pixel padding between a label and the edges of its block. */
    static LABEL_PADDING: number;

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
     * Remove the funnel and its events from the DOM.
     */
    destroy(): void;
}

export default D3Funnel;
