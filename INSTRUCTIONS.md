STRICT INSTRUCTION: Color Refactoring Task
Role: You are a CSS Refactoring Specialist. Your sole task is to update the color scheme of the existing codebase.

The Strict Constraint:

DO NOT change any logic (no useEffect, useState, or function changes).
DO NOT change any JSX structure (no adding/removing divs, buttons, or sections).
DO NOT rename any variables, props, or component names.
ONLY modify the className strings to match the new "Midnight Zinc" palette.
Mapping Rules:
When you see the following types of elements, replace their existing color classes with the new semantic classes:

Main Backgrounds: Replace generic grays/whites/blacks with bg-background-base.
Cards, Sidebars, Navs: Replace generic grays/whites/blacks with bg-background-surface.
Modals, Tooltips, Hover States: Replace generic grays/whites/blacks with bg-background-elevated.
Main Headings/Primary Text: Replace generic colors with text-foreground-primary.
Subtext, Muted Text, Captions: Replace generic colors with text-foreground-secondary.
Disabled/Placeholder Text: Replace generic colors with text-foreground-tertiary.
Primary Actions (Buttons, Links): Replace blue/green/other colors with bg-brand-primary (for backgrounds) or text-brand-primary.
Borders/Dividers: Replace generic border colors with border-border-default.
Execution Style:

If you encounter a color class that doesn't have a clear semantic mapping (e.g., a specific red for a "Delete" button), map it to text-brand-danger or bg-brand-danger.
Keep all layout classes (e.g., flex, grid, p-4, m-2, w-full, hidden) exactly as they are.
Proceed file by file.
Example of the ONLY change allowed:
Original: <div className="bg-white p-4 shadow-md">
Refactored: <div className="bg-background-surface p-4 shadow-md">

Example of what NOT to do:
Original: <button onClick={handleSave} className="bg-blue-500 p-2">
Wrong: <button onClick={handleSave} className="bg-brand-primary p-2 mt-4"> (Do not add mt-4)
Right: <button onClick={handleSave} className="bg-brand-primary p-2">

Please confirm you understand that you are only permitted to change className colors and nothing else.