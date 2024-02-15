import {
  BlockNoteEditor,
  BlockSchema,
  DefaultBlockSchema,
  DefaultInlineContentSchema,
  DefaultStyleSchema,
  InlineContentSchema,
  StyleSchema,
  SuggestionMenuState,
} from "@blocknote/core";
import { flip, offset, size } from "@floating-ui/react";
import { FC } from "react";

import { useUIPluginState } from "../../hooks/useUIPluginState";
import { useUiElementPositioning } from "../../hooks/useUiElementPositioning";
import { DefaultSuggestionMenu } from "./DefaultSuggestionMenu";
import { MantineSuggestionMenuProps } from "./MantineDefaults/MantineSuggestionMenu";
import { MantineSuggestionMenuItemProps } from "./MantineDefaults/MantineSuggestionMenuItem";

export function DefaultPositionedSuggestionMenu<
  BSchema extends BlockSchema = DefaultBlockSchema,
  I extends InlineContentSchema = DefaultInlineContentSchema,
  S extends StyleSchema = DefaultStyleSchema,
  Item extends {
    name: string;
    execute: () => void;
  } = MantineSuggestionMenuItemProps
>(props: {
  editor: BlockNoteEditor<BSchema, I, S>;
  triggerCharacter?: string;
  getItems?: (
    query: string,
    closeMenu: () => void,
    clearQuery: () => void
  ) => Promise<Item[]>;
  suggestionMenuComponent?: FC<MantineSuggestionMenuProps<Item>>;
}) {
  const callbacks = {
    closeMenu: props.editor.suggestionMenus.closeMenu,
    clearQuery: props.editor.suggestionMenus.clearQuery,
  };

  const state = useUIPluginState(
    (callback: (state: SuggestionMenuState) => void) =>
      props.editor.suggestionMenus.onUpdate.bind(props.editor.suggestionMenus)(
        props.triggerCharacter || "/",
        callback
      )
  );
  const { isMounted, ref, style } = useUiElementPositioning(
    state?.show || false,
    state?.referencePos || null,
    2000,
    {
      placement: "bottom-start",
      middleware: [
        offset(10),
        // Flips the menu placement to maximize the space available, and prevents
        // the menu from being cut off by the confines of the screen.
        flip(),
        size({
          apply({ availableHeight, elements }) {
            Object.assign(elements.floating.style, {
              maxHeight: `${availableHeight - 10}px`,
            });
          },
        }),
      ],
    }
  );

  if (!isMounted || !state) {
    return null;
  }

  const { show, referencePos, ...data } = state;

  return (
    <div ref={ref} style={style}>
      <DefaultSuggestionMenu
        editor={props.editor}
        getItems={props.getItems}
        suggestionMenuComponent={props.suggestionMenuComponent}
        {...data}
        {...callbacks}
      />
    </div>
  );
}
