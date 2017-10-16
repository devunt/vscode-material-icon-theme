import * as path from 'path';
import * as fs from 'fs';
import { fileIcons, folderIcons, languageIcons, openedFolder, lightVersion, highContrastVersion } from './../../../src/icons';
import * as painter from './../../helpers/painter';
import { FolderTheme, FolderIcon, DefaultIcon } from '../../../src/models/index';

/**
 * Defines the folder where all icon files are located.
 */
const folderPath = path.join('icons');

/**
 * Defines an array with all icons that can be found in the file system.
 */
const availableIcons: { [s: string]: string } = {};

const unusedIcons = [];

/**
 * Get all icon file names from the file system.
 */
const fsReadAllIconFiles = (err: Error, files: string[]) => {
    if (err) {
        throw Error(err.message);
    }

    files.forEach(file => {
        const fileName = file;
        const iconName = path.parse(file).name;
        availableIcons[iconName] = fileName;
    });

    checkUsageOfAllIcons();
    showWarningMessage();
};

const checkUsageOfAllIcons = () => {
    const usedFileIcons: string[] = getAllUsedFileIcons();
    const usedFolderIcons: string[] = getAllUsedFolderIcons();
    const usedLanguageIcons: string[] = getAllUsedLanguageIcons();

    [].concat(
        usedFileIcons,
        usedFolderIcons,
        usedLanguageIcons
    ).forEach(icon => {
        delete availableIcons[icon];
    });
};

const showWarningMessage = () => {
    const amountOfUnusedIcons = Object.keys(availableIcons).length;
    if (amountOfUnusedIcons === 0) {
        console.log('> Material Icon Theme:', painter.green(`Passed icon usage rate checks!`));
    } else {
        console.log(`> Material Icon Theme: ` + painter.yellow(`${amountOfUnusedIcons} unused icon(s):`));
        Object.keys(availableIcons).forEach(icon => {
            console.log(painter.yellow(`- ${availableIcons[icon]}`));
        });
    }
};

// read from the file system
export const check = () => fs.readdir(folderPath, fsReadAllIconFiles);

const getAllUsedFileIcons = (): string[] => {
    const icons = [
        fileIcons.defaultIcon.name,
        ...fileIcons.icons.map(icon => icon.name),
        ...fileIcons.icons.filter(icon => icon.light).map(icon => icon.name + lightVersion),
        ...fileIcons.icons.filter(icon => icon.highContrast).map(icon => icon.name + highContrastVersion)
    ];
    return icons;
};

const getAllUsedFolderIcons = (): string[] => {
    const icons = folderIcons.map(
        theme => theme.name === 'none' ? [] : getAllFolderIcons(theme)
    ).reduce((a, b) => a.concat(b));
    return icons.map(icon => {
        return [
            icon.name,
            icon.name + openedFolder,
            icon.light ? icon.name + lightVersion : undefined,
            icon.light ? icon.name + openedFolder + lightVersion : undefined,
            icon.highContrast ? icon.name + highContrastVersion : undefined,
            icon.highContrast ? icon.name + openedFolder + highContrastVersion : undefined
        ];
    }).filter(icon => icon !== undefined)
        .reduce((a, b) => a.concat(b));
};

const getAllFolderIcons = (theme: FolderTheme): (FolderIcon | DefaultIcon)[] => {
    const icons = theme.icons ? theme.icons : [];
    return [
        theme.defaultIcon,
        theme.rootFolder,
        ...icons
    ].filter(icon => icon !== undefined); // filter undefined root folder icons
};

const getAllUsedLanguageIcons = (): string[] => {
    const icons = [
        ...languageIcons.languages.map(lang => lang.icon)
    ];
    return icons;
};
