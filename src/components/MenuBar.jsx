import React from 'react';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
} from "@/components/ui/menubar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  Save,
  Eye,
  ZoomIn,
  Type,
  Moon,
  Sun,
  Maximize,
  Share2,
  Settings,
  List,
  Undo,
  Redo,
} from "lucide-react";
import { AIFunctions } from './AIFunctions';

export const MenuBar = ({
  openFile,
  downloadFile,
  saveNote,
  shareNote,
  renderMarkdown,
  setRenderMarkdown,
  showLineNumbers,
  setShowLineNumbers,
  uiScale,
  setUiScale,
  fontSize,
  setFontSize,
  darkMode,
  setDarkMode,
  toggleFullscreen,
  setIsSettingsOpen,
  aiActions,
  sendAIRequest,
  handleEditPrompt,
  handleAddPrompt,
  isPromptEditOpen,
  setIsPromptEditOpen,
  currentPrompt,
  setCurrentPrompt,
  handleUndo,
  handleRedo,
}) => {
  return (
    <Menubar className="px-2 border-b border-border flex justify-between items-center">
      <div className="flex items-center">
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={openFile}>
              <FileText className="mr-2 h-4 w-4" />
              Open
            </MenubarItem>
            <MenubarItem onClick={downloadFile}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </MenubarItem>
            <MenubarItem onClick={saveNote}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </MenubarItem>
            <MenubarItem onClick={shareNote}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              <div className="flex items-center">
                <Eye className="mr-2 h-4 w-4" />
                <Label htmlFor="markdown-switch" className="mr-2">
                  Render Markdown
                </Label>
                <Switch
                  id="markdown-switch"
                  checked={renderMarkdown}
                  onCheckedChange={setRenderMarkdown}
                />
              </div>
            </MenubarItem>
            <MenubarItem>
              <div className="flex items-center">
                <List className="mr-2 h-4 w-4" />
                <Label htmlFor="line-numbers-switch" className="mr-2">
                  Show Line Numbers
                </Label>
                <Switch
                  id="line-numbers-switch"
                  checked={showLineNumbers}
                  onCheckedChange={setShowLineNumbers}
                />
              </div>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem>
              <div className="flex items-center">
                <ZoomIn className="mr-2 h-4 w-4" />
                <Label htmlFor="ui-scale" className="mr-2">
                  UI Scale
                </Label>
                <Slider
                  id="ui-scale"
                  min={50}
                  max={200}
                  step={10}
                  value={[uiScale]}
                  onValueChange={(value) => setUiScale(value[0])}
                  className="w-32"
                />
              </div>
            </MenubarItem>
            <MenubarItem>
              <div className="flex items-center">
                <Type className="mr-2 h-4 w-4" />
                <Label htmlFor="font-size" className="mr-2">
                  Font Size
                </Label>
                <Slider
                  id="font-size"
                  min={8}
                  max={24}
                  step={1}
                  value={[fontSize]}
                  onValueChange={(value) => setFontSize(value[0])}
                  className="w-32"
                />
              </div>
            </MenubarItem>
            <MenubarItem>
              <div className="flex items-center">
                {darkMode ? (
                  <Moon className="mr-2 h-4 w-4" />
                ) : (
                  <Sun className="mr-2 h-4 w-4" />
                )}
                <Label htmlFor="dark-mode-switch" className="mr-2">
                  Dark Mode
                </Label>
                <Switch
                  id="dark-mode-switch"
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
            </MenubarItem>
            <MenubarItem onClick={toggleFullscreen}>
              <Maximize className="mr-2 h-4 w-4" />
              Fullscreen
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>AI</MenubarTrigger>
          <MenubarContent>
            <AIFunctions
              aiActions={aiActions}
              sendAIRequest={sendAIRequest}
              handleEditPrompt={handleEditPrompt}
              handleAddPrompt={handleAddPrompt}
              isPromptEditOpen={isPromptEditOpen}
              setIsPromptEditOpen={setIsPromptEditOpen}
              currentPrompt={currentPrompt}
              setCurrentPrompt={setCurrentPrompt}
              closeMenu={() => document.body.click()} // This will close the menu
            />
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Settings</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => setIsSettingsOpen(true)}>
              <Settings className="mr-2 h-4 w-4" />
              Set Note ID
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" onClick={handleUndo}>
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleRedo}>
          <Redo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setRenderMarkdown(!renderMarkdown)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    </Menubar>
  );
};