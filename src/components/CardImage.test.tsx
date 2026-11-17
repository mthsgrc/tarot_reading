import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ALL_CARDS } from "../data/cards";
import { CardImage } from "./CardImage";

describe("CardImage", () => {
  it("clears a failed image when the card changes", () => {
    const first = ALL_CARDS[0]!;
    const second = ALL_CARDS[1]!;
    const { rerender } = render(<CardImage card={first} />);

    fireEvent.error(
      screen.getByRole("img", { name: `${first.name} from the Thoth Tarot` }),
    );
    expect(screen.getByText(first.name)).toBeInTheDocument();

    rerender(<CardImage card={second} />);

    expect(screen.queryByText(first.name)).not.toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: `${second.name} from the Thoth Tarot` }),
    ).toBeInTheDocument();
  });
});
