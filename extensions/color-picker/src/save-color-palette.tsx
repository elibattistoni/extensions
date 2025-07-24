import { Action, ActionPanel, Form, LaunchProps, showToast } from "@raycast/api";
import { ColorItem } from "./types";

interface SaveColorPaletteProps extends LaunchProps {
  launchContext?: {
    selectedColors?: ColorItem[];
  };
}

type Values = {
  paletteName: string;
};

export default function Command(props: SaveColorPaletteProps) {
  const selectedColors = props.launchContext?.selectedColors || [];

  console.log("Selected colors for palette:", selectedColors);

  function handleSubmit(values: Values) {
    console.log("Form values:", values);
    console.log("Colors to save in palette:", selectedColors);
    showToast({ title: "Palette saved", message: `"${values.paletteName}" with ${selectedColors.length} colors` });
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} title="Save Palette" />
        </ActionPanel>
      }
    >
      <Form.Description text={`Create a new color palette with ${selectedColors.length} selected colors.`} />
      <Form.TextField id="paletteName" title="Palette Name" placeholder="Enter palette name" defaultValue="" />
      <Form.Separator />
      <Form.Description text="Selected Colors:" />
      {selectedColors.map((colorItem, index) => (
        <Form.Description key={colorItem.id} text={`${index + 1}. ${colorItem.color}`} />
      ))}
    </Form>
  );
}
