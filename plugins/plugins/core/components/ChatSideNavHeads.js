import { html, LitElement } from 'lit'
import { Epml } from '../../../epml'
import { chatSideNavHeadsStyles } from './plugins-css'
import '@material/mwc-icon'

const parentEpml = new Epml({ type: 'WINDOW', source: window.parent })

class ChatSideNavHeads extends LitElement {
	static get properties() {
		return {
			selectedAddress: { type: Object },
			config: { type: Object },
			chatInfo: { type: Object },
			iconName: { type: String },
			activeChatHeadUrl: { type: String },
			isImageLoaded: { type: Boolean },
			setActiveChatHeadUrl: { attribute: false }
		}
	}

	static get styles() {
		return [chatSideNavHeadsStyles]
	}

	constructor() {
		super()
		this.selectedAddress = {}
		this.config = {
			user: {
				node: {
				}
			}
		}
		this.chatInfo = {}
		this.iconName = ''
		this.activeChatHeadUrl = ''
		this.isImageLoaded = false
		this.imageFetches = 0
	}

	render() {
		let avatarImg = ''

		if (this.chatInfo.name) {
			const myNode = window.parent.reduxStore.getState().app.nodeConfig.knownNodes[window.parent.reduxStore.getState().app.nodeConfig.node]
			const nodeUrl = myNode.protocol + '://' + myNode.domain + ':' + myNode.port
			const avatarUrl = `${nodeUrl}/arbitrary/THUMBNAIL/${this.chatInfo.name}/qortal_avatar?async=true`
			avatarImg = this.createImage(avatarUrl)
		}

		return html`
			<li @click=${() => this.getUrl(this.chatInfo)} class="clearfix">
				${this.isImageLoaded ? html`${avatarImg}` : html``}
				${!this.isImageLoaded && !this.chatInfo.name && !this.chatInfo.groupName ? html`<mwc-icon class="img-icon">account_circle</mwc-icon>` : html``}
				${!this.isImageLoaded && this.chatInfo.name ?
					html`
						<div
							style="width:30px; height:30px; float: left; border-radius:50%; background: ${this.activeChatHeadUrl === this.chatInfo.url ? "var(--chatHeadBgActive)"
							: "var(--chatHeadBg)"}; color: ${this.activeChatHeadUrl === this.chatInfo.url ? "var(--chatHeadTextActive)"
							: "var(--chatHeadText)"}; font-weight:bold; display: flex; justify-content: center; align-items: center; text-transform: capitalize"
						>
							${this.chatInfo.name.charAt(0)}
						</div>
					`
					: ""
				}
				${!this.isImageLoaded && this.chatInfo.groupName ?
					html`
						<div
							style="width:30px; height:30px; float: left; border-radius:50%; background: ${this.activeChatHeadUrl === this.chatInfo.url ? "var(--chatHeadBgActive)"
							: "var(--chatHeadBg)"}; color: ${this.activeChatHeadUrl === this.chatInfo.url ? "var(--chatHeadTextActive)"
							: "var(--chatHeadText)"}; font-weight:bold; display: flex; justify-content: center; align-items: center; text-transform: capitalize"
						>
							${this.chatInfo.groupName.charAt(0)}
						</div>
					`
					: ""
				}
				<div>
					<div class="name">
						<span style="float:left; padding-left: 8px; color: var(--chat-group);">
							${this.chatInfo.groupName ? this.chatInfo.groupName : this.chatInfo.name !== undefined ? this.chatInfo.name : this.chatInfo.address.substr(0, 15)}
						</span>
					</div>
				</div>
			</li>
		`
	}

	firstUpdated() {
		let configLoaded = false

		parentEpml.ready().then(() => {
			parentEpml.subscribe('selected_address', async selectedAddress => {
				this.selectedAddress = {}
				selectedAddress = JSON.parse(selectedAddress)
				if (!selectedAddress || Object.entries(selectedAddress).length === 0) return
				this.selectedAddress = selectedAddress
			})

			parentEpml.subscribe('config', c => {
				if (!configLoaded) {
					configLoaded = true
				}
				this.config = JSON.parse(c)
			})
		})

		parentEpml.imReady()
	}

	createImage(imageUrl) {
		const imageHTMLRes = new Image()

		imageHTMLRes.src = imageUrl
		imageHTMLRes.style = "width:30px; height:30px; float: left; border-radius:50%; font-size:14px"

		imageHTMLRes.onclick = () => {
			this.openDialogImage = true
		}

		imageHTMLRes.onload = () => {
			this.isImageLoaded = true
		}

		imageHTMLRes.onerror = () => {
			if (this.imageFetches < 4) {
				setTimeout(() => {
					this.imageFetches = this.imageFetches + 1
					imageHTMLRes.src = imageUrl
				}, 500)
			} else {
				this.isImageLoaded = false
			}
		}

		return imageHTMLRes
	}

	shouldUpdate(changedProperties) {
		if (changedProperties.has('activeChatHeadUrl')) {
			return true
		}

		if (changedProperties.has('chatInfo')) {
			return true
		}

		if (changedProperties.has('isImageLoaded')) {
			return true
		}

		return false
	}

	getUrl(chatUrl) {
		this.setActiveChatHeadUrl(chatUrl)
	}

	onPageNavigation(pageUrl) {
		parentEpml.request('setPageUrl', pageUrl)
	}

	// Standard functions
	getApiKey() {
		const myNode = window.parent.reduxStore.getState().app.nodeConfig.knownNodes[window.parent.reduxStore.getState().app.nodeConfig.node]
		return myNode.apiKey
	}

	isEmptyArray(arr) {
		if (!arr) { return true }
		return arr.length === 0
	}

	round(number) {
		return (Math.round(parseFloat(number) * 1e8) / 1e8).toFixed(8)
	}
}

window.customElements.define('chat-side-nav-heads', ChatSideNavHeads)
