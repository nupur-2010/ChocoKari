// @ts-nocheck
import { GRID_FOR_SIZE, FLAVOUR_COLORS } from "../lib/constants";

export default function ArrangementGrid({ custom, showNames = true }) {
    if (!custom) return null;
    const grid = GRID_FOR_SIZE[custom.size] || { rows: 2, cols: 3 };
    const arrangement = custom.arrangement || [];
    return (
        <div className="w-full h-full flex items-center justify-center">
            <div
                className="w-full grid gap-0.5"
                style={{
                    gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
                    gridAutoRows: "1fr",
                }}
            >
                {arrangement.map((cell, i) => {
                    const flavour = cell.flavour || cell;
                    const gradient = FLAVOUR_COLORS[flavour] || "from-cream/30 to-cream/50";
                    return (
                        <div
                            key={i}
                            className={`rounded aspect-square flex items-center justify-center text-center overflow-hidden bg-linear-to-br ${gradient}`}
                        >
                            {flavour && showNames ? (
                                <p className="text-[6px] sm:text-[7px] text-chocolate-dark font-semibold leading-tight px-0.5 wrap-break-word">
                                    {flavour}
                                </p>
                            ) : flavour ? (
                                <span className="text-chocolate/40 text-[10px]">{i + 1}</span>
                            ) : null}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
