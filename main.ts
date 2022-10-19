import { request } from 'http';
import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, renderResults, requestUrl, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface PluginSettings {
	enabled: boolean;
}

const DEFAULT_SETTINGS: PluginSettings = {
	enabled: false
}

export default class MyPlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		this.registerMarkdownCodeBlockProcessor("codepen-iframe", async (source, el, ctx) => {
			const rows = source.split("\n").filter((row) => row.length > 0);

			const linkIndex = rows.findIndex(s => s.startsWith("link: "));
			const link = linkIndex === null ? "" : rows[linkIndex].replace("link: ", "");

			const widthIndex = rows.findIndex(s => s.startsWith("width: "));
			const width = widthIndex === null ? "" : rows[widthIndex].replace("width: ", "");

			const heightIndex = rows.findIndex(s => s.startsWith("height: "));
			const height = heightIndex === null ? "" : rows[heightIndex].replace("height: ", "");

			const classIndex = rows.findIndex(s => s.startsWith("class: "));
			const clazz = classIndex === null ? "" : rows[classIndex].replace("class: ", "");

			const headers = {
				"Authorization": "bearer somewhat"
			}

			if (link != "") {
				// get the content from the pen
				var content = ""
				await requestUrl({ url: link, headers: headers })
					.then(res => content = res.text)
					.catch(err => console.error(err));

				// create a div to take the iframe from
				const div = createDiv();
				div.innerHTML = content;

				// the iframe set to its width and height
				var result: HTMLElement = div.find('#result');
				result.style.width = width;
				result.style.height = height;
				result.classList.add(clazz);

				// set the iframe as to the inner html of the codeblock
				el.innerHTML = result.outerHTML;
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new MainSettingsTab(this.app, this));

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class MainSettingsTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Enable Plugin')
			.setDesc('Enables / Disables the Plugin')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enabled)
				.onChange(async (value) => {
					console.log("Codepen Iframes " + true);
					this.plugin.settings.enabled = value;
					await this.plugin.saveSettings();
				})
			);
	}
}
