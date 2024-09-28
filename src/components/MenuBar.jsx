import React from 'react';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
} from "@/components/ui/menubar";
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
  HelpCircle,
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
  setIsHelpOpen,
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
            <MenubarItem onClick={() => setRenderMarkdown(!renderMarkdown)}>
              <Eye className="mr-2 h-4 w-4" />
              {renderMarkdown ? "Hide" : "Render"} Markdown
            </MenubarItem>
            <MenubarItem onClick={() => setShowLineNumbers(!showLineNumbers)}>
              <List className="mr-2 h-4 w-4" />
              {showLineNumbers ? "Hide" : "Show"} Line Numbers
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
            <MenubarItem onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              {darkMode ? "Light" : "Dark"} Mode
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
              closeMenu={() => document.body.click()}
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
            <MenubarItem onClick={() => setIsHelpOpen(true)}>
              <HelpCircle className="mr-2 h-4 w-4" />
              Help
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