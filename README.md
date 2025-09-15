# Resonite-Inventory-Viewer

[Use the tool here!](https://armored-dragon.github.io/Resonite-Inventory-Viewer/index)

This is a simple in-browser inventory viewer for Resonite. The goal for this app is to make it easier to find out what is eating so much storage space in a given account.

> [!IMPORTANT]  
> Please note that the core of this application, the file-size interpretation, is not 1:1 linked to how Resonite handles used storage space. All values displayed are base-effort estimates.

## Instructions

This website uses a JSON file produced by Resonite. In order to use this tool, you need to get your "Record Usage JSON" file.

To obtain this file you need to login to your Resonite account and send the Resonite bot the message `/requestRecordUsageJSON`. After you submit this command, Resonite will email you shortly after with an attachment that contains the file you will need.

[Resonite Bot Storage Commands Wiki](https://wiki.resonite.com/Resonite_bot#Storage_commands)

Once you have your file, continue to [the website](https://armored-dragon.github.io/Resonite-Inventory-Viewer/index) and select the `.json` file in the file browser input, and this app should take care of the rest.

> [!CAUTION]
> Be aware that sharing the content displayed from your Resonite JSON file is dangerous as this may give other people access to spawn and interact with private items. Just as you would not share your Resonite JSON file, do not share the content displayed from this website.

## Usage

You can click the name of any listing to be directed to a page with more information about the asset.

Currently this offers displaying the following content:

- Name
- ID
- Assets
  - Total Assets (Estimate)
  - Unique Assets (Estimate)
- Estimate Size
- Item Path
- Thumbnail