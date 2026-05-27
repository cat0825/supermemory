"use client"

import {
	CheckIcon,
	ChevronUpIcon,
	Loader2Icon,
	PaperclipIcon,
	RotateCcwIcon,
	XIcon,
} from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@repo/ui/components/dialog"
import NovaOrb from "@/components/nova/nova-orb"
import { cn } from "@lib/utils"
import { dmSansClassName } from "@/lib/fonts"
import { type ReactNode, useEffect, useRef, useState } from "react"
import { motion } from "motion/react"
import { SendButton, StopButton } from "./actions"
import {
	CHAT_ATTACHMENT_ACCEPT,
	type ChatAttachmentDraft,
	formatAttachmentSize,
} from "../attachments"

interface ChatInputProps {
	value: string
	onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
	onSend: () => void
	onStop: () => void
	onKeyDown?: (e: React.KeyboardEvent) => void
	isResponding?: boolean
	activeStatus?: string
	chainOfThoughtComponent?: React.ReactNode
	onExpandedChange?: (expanded: boolean) => void
	/** Model + space controls on one row with send; textarea full-width above */
	stackedToolbar?: ReactNode
	/** Nova status row + chain-of-thought toggle (off for e.g. home composer) */
	showStatusStrip?: boolean
	attachments?: ChatAttachmentDraft[]
	onAddAttachmentFiles?: (files: FileList | File[]) => void
	onRemoveAttachment?: (id: string) => void
	onToggleAttachmentSave?: (id: string) => void
	onRetryAttachment?: (id: string) => void
	canSend?: boolean
	attachmentAccept?: string
}

export default function ChatInput({
	value,
	onChange,
	onSend,
	onStop,
	onKeyDown,
	isResponding = false,
	activeStatus,
	chainOfThoughtComponent,
	onExpandedChange,
	stackedToolbar,
	showStatusStrip = true,
	attachments = [],
	onAddAttachmentFiles,
	onRemoveAttachment,
	onToggleAttachmentSave,
	onRetryAttachment,
	canSend,
	attachmentAccept = CHAT_ATTACHMENT_ACCEPT,
}: ChatInputProps) {
	const [isMultiline, setIsMultiline] = useState(false)
	const [isExpanded, setIsExpanded] = useState(false)
	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (!showStatusStrip && isExpanded) {
			setIsExpanded(false)
			onExpandedChange?.(false)
		}
	}, [isExpanded, onExpandedChange, showStatusStrip])

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		onChange(e)

		const textarea = e.target
		textarea.style.height = "auto"

		// Set height based on scrollHeight, with a max of ~96px (4-5 lines)
		const newHeight = Math.min(textarea.scrollHeight, 96)
		textarea.style.height = `${newHeight}px`

		setIsMultiline(textarea.scrollHeight > 52)
	}

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files
		if (files?.length) onAddAttachmentFiles?.(files)
		e.target.value = ""
	}

	const showAttachments = attachments.length > 0
	const sendEnabled = canSend ?? value.trim().length > 0

	const attachmentTray = showAttachments ? (
		<div className="scrollbar-none flex max-w-full gap-2 overflow-x-auto px-0 pb-1 sm:px-1">
			{attachments.map((attachment) => {
				return (
					<AttachmentPreviewChip
						key={attachment.id}
						attachment={attachment}
						onRemove={onRemoveAttachment}
						onToggleSave={onToggleAttachmentSave}
						onRetry={onRetryAttachment}
					/>
				)
			})}
		</div>
	) : null

	const attachmentButton = onAddAttachmentFiles ? (
		<>
			<input
				ref={fileInputRef}
				type="file"
				multiple
				accept={attachmentAccept}
				onChange={handleFileSelect}
				className="hidden"
			/>
			<button
				type="button"
				onClick={() => fileInputRef.current?.click()}
				disabled={isResponding}
				className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[#242832] bg-black text-[#A6B0BE] transition-colors hover:border-[#3A4049] hover:bg-[#111418] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
				aria-label="Attach files"
				title="Attach files"
			>
				<PaperclipIcon className="size-4" />
			</button>
		</>
	) : null

	return (
		<motion.div
			className={cn("relative z-20!")}
			animate={{
				padding: showStatusStrip ? (isExpanded ? "16px" : "0") : "0",
				margin: showStatusStrip ? (isExpanded ? "0" : "16px") : "0",
				borderRadius: showStatusStrip
					? isExpanded
						? "0 0 12px 12px"
						: "12px"
					: "0",
				backgroundColor: showStatusStrip
					? isExpanded
						? "#000B1B"
						: "#01173C"
					: "transparent",
			}}
			transition={{
				duration: 0.3,
				ease: "easeOut",
			}}
		>
			{showStatusStrip ? (
				<>
					<div
						className={cn(
							"absolute bottom-full left-0 right-0 overflow-hidden transition-all duration-300 ease-out bg-[#000B1B]",
							isExpanded
								? "max-h-[min(60dvh,420px)] opacity-100 overflow-y-auto pt-1.5 pb-2 rounded-t-xl px-4"
								: "max-h-0 opacity-0",
						)}
						style={{
							zIndex: isExpanded ? 50 : 0,
						}}
					>
						{chainOfThoughtComponent}
					</div>
					<button
						type="button"
						className={cn(
							"w-full p-3 pr-4 flex items-center justify-between cursor-pointer bg-transparent border-0 text-left",
							!chainOfThoughtComponent && "disabled:cursor-not-allowed",
						)}
						onClick={() => {
							const newExpanded = !isExpanded
							setIsExpanded(newExpanded)
							onExpandedChange?.(newExpanded)
						}}
						disabled={!chainOfThoughtComponent}
					>
						<div className="flex items-center gap-3">
							<NovaOrb size={24} className="blur-[1px]! z-10" />
							<p className={cn("text-[#525D6E]", dmSansClassName())}>
								{activeStatus || "Waiting for input..."}
							</p>
						</div>
						{chainOfThoughtComponent && (
							<ChevronUpIcon
								className={cn(
									"size-4 text-[#525D6E] transition-transform duration-300",
									isExpanded && "rotate-180",
								)}
							/>
						)}
					</button>
				</>
			) : null}
			{stackedToolbar ? (
				<div className="flex flex-col gap-2 rounded-xl bg-surface-card/60 backdrop-blur-md p-2 shadow-[0_16px_48px_rgba(0,0,0,0.34)] transition-all duration-200 focus-within:ring-1 focus-within:ring-fg-primary/10">
					{attachmentTray}
					<textarea
						ref={textareaRef}
						value={value}
						onChange={handleChange}
						onKeyDown={onKeyDown}
						placeholder="Ask your supermemory..."
						className="w-full resize-none overflow-y-auto bg-transparent p-2 text-fg-primary transition-all duration-200 placeholder:text-fg-faint focus:outline-none"
						style={{ minHeight: "36px" }}
						rows={1}
						disabled={isResponding}
					/>
					<div className="flex items-center gap-2">
						{attachmentButton}
						<div className="flex min-w-0 flex-1 items-center gap-2">
							{stackedToolbar}
						</div>
						<div className="shrink-0">
							{isResponding ? (
								<StopButton onClick={onStop} />
							) : (
								<SendButton onClick={onSend} disabled={!sendEnabled} />
							)}
						</div>
					</div>
				</div>
			) : (
				<div
					className={cn(
						"flex flex-col gap-2 rounded-xl bg-surface-card/60 backdrop-blur-md p-2 shadow-[0_16px_48px_rgba(0,0,0,0.34)] transition-all duration-200 focus-within:ring-1 focus-within:ring-fg-primary/10",
						isMultiline && "flex-col",
					)}
				>
					{attachmentTray}
					<textarea
						ref={textareaRef}
						value={value}
						onChange={handleChange}
						onKeyDown={onKeyDown}
						placeholder="Ask your supermemory..."
						className="w-full resize-none overflow-y-auto bg-transparent p-2 text-fg-primary transition-all duration-200 placeholder:text-fg-faint focus:outline-none"
						style={{ minHeight: "36px" }}
						rows={1}
						disabled={isResponding}
					/>
					<div className="flex w-full items-center justify-end gap-2 transition-all duration-200">
						{attachmentButton}
						{isResponding ? (
							<StopButton onClick={onStop} />
						) : (
							<SendButton onClick={onSend} disabled={!sendEnabled} />
						)}
					</div>
				</div>
			)}
		</motion.div>
	)
}

function AttachmentPreviewChip({
	attachment,
	onRemove,
	onToggleSave,
	onRetry,
}: {
	attachment: ChatAttachmentDraft
	onRemove?: (id: string) => void
	onToggleSave?: (id: string) => void
	onRetry?: (id: string) => void
}) {
	const [objectUrl, setObjectUrl] = useState<string | null>(null)
	const [isPreviewOpen, setIsPreviewOpen] = useState(false)
	const isUploading = attachment.status === "uploading"
	const isUploaded = attachment.status === "uploaded"
	const isError = attachment.status === "error"
	const isImage = attachment.file.type.startsWith("image/")
	const extension = getAttachmentExtension(attachment.file)

	useEffect(() => {
		if (!isImage) {
			setObjectUrl(null)
			return
		}

		const url = URL.createObjectURL(attachment.file)
		setObjectUrl(url)
		return () => URL.revokeObjectURL(url)
	}, [attachment.file, isImage])

	const statusLabel = isError
		? attachment.errorMessage || "Upload failed"
		: isUploading
			? "Uploading..."
			: isUploaded
				? "Uploaded"
				: formatAttachmentSize(attachment.file.size)

	return (
		<>
			<div
				className={cn(
					"group relative flex h-11 w-[min(280px,calc(100vw-4.5rem))] shrink-0 items-center gap-2 overflow-hidden rounded-xl border border-[#1A1D22] bg-[#050607] px-2 text-sm text-fg-primary shadow-[0_6px_18px_rgba(0,0,0,0.22)] transition-colors hover:border-[#30343B] hover:bg-[#080A0D] focus-within:border-[#30343B] sm:w-auto sm:min-w-[220px] sm:max-w-[300px] sm:hover:border-[#2261CA66] sm:hover:bg-[#041127] sm:focus-within:border-[#2261CA66] sm:focus-within:bg-[#041127]",
					isImage && objectUrl && "cursor-pointer",
					isError && "border-red-400/40 bg-red-950/20 hover:border-red-400/50",
				)}
				title={statusLabel}
			>
				<button
					type="button"
					onClick={() => isImage && objectUrl && setIsPreviewOpen(true)}
					disabled={!isImage || !objectUrl}
					className={cn(
						"relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#242832] bg-black",
						isImage && objectUrl && "cursor-pointer hover:border-[#4B5563]",
						(!isImage || !objectUrl) && "cursor-default",
					)}
					aria-label={
						isImage ? `Preview ${attachment.file.name}` : attachment.file.name
					}
				>
					{isImage && objectUrl ? (
						<img
							src={objectUrl}
							alt=""
							className="size-full object-cover"
							draggable={false}
						/>
					) : (
						<DocumentFileGlyph label={extension} />
					)}
					{isUploading || isUploaded ? (
						<div className="absolute inset-0 flex items-center justify-center bg-black/60">
							{isUploading ? (
								<Loader2Icon className="size-3.5 animate-spin text-[#C8D1DC]" />
							) : (
								<CheckIcon className="size-3.5 text-emerald-400" />
							)}
						</div>
					) : null}
				</button>
				<div className="min-w-0 flex-1 pr-1">
					<div
						className="truncate font-medium leading-none text-fg-primary"
						title={attachment.file.name}
					>
						{attachment.file.name}
					</div>
					<div className="mt-1 truncate text-[11px] leading-none text-fg-faint">
						{statusLabel}
					</div>
				</div>
				<div className="hidden shrink-0 items-center gap-1 opacity-0 transition-opacity sm:flex sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
					{onToggleSave ? (
						<button
							type="button"
							onClick={(event) => {
								event.stopPropagation()
								onToggleSave(attachment.id)
							}}
							disabled={isUploading}
							className={cn(
								"flex h-7 items-center rounded-md border border-[#242832] bg-black px-2 text-[11px] font-medium text-[#D7DCE2] transition-colors hover:border-[#3A4049] hover:bg-[#111418] disabled:cursor-not-allowed disabled:opacity-50",
								attachment.saveToMemory &&
									"border-[#2261CA33] bg-[#041127] text-[#4BA0FA] hover:border-[#3374FF]/55 hover:bg-[#0A1A3A] hover:text-white",
							)}
							aria-label={
								attachment.saveToMemory
									? `Do not save ${attachment.file.name} to memory`
									: `Save ${attachment.file.name} to memory`
							}
							title={attachment.saveToMemory ? "Save to memory" : "Chat only"}
						>
							{attachment.saveToMemory ? "Save" : "Chat only"}
						</button>
					) : null}
					{isError ? (
						<button
							type="button"
							onClick={(event) => {
								event.stopPropagation()
								onRetry?.(attachment.id)
							}}
							className="flex size-7 shrink-0 items-center justify-center rounded-md border border-[#242832] bg-black text-fg-faint transition-colors hover:border-[#3A4049] hover:bg-[#111418] hover:text-fg-primary"
							aria-label={`Retry ${attachment.file.name}`}
							title={statusLabel}
						>
							<RotateCcwIcon className="size-3.5" />
						</button>
					) : null}
				</div>
				<button
					type="button"
					onClick={(event) => {
						event.stopPropagation()
						onRemove?.(attachment.id)
					}}
					disabled={isUploading}
					className="flex size-7 shrink-0 items-center justify-center rounded-md text-fg-faint transition-colors hover:bg-[#111418] hover:text-fg-primary disabled:cursor-not-allowed disabled:opacity-50"
					aria-label={`Remove ${attachment.file.name}`}
				>
					<XIcon className="size-4" />
				</button>
			</div>
			<Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
				<DialogContent
					showCloseButton={false}
					className="w-[calc(100vw-32px)] max-w-none gap-0 overflow-hidden rounded-xl border border-[#1D222A] bg-[#050607] p-0 text-fg-primary shadow-[0_24px_80px_rgba(0,0,0,0.65)] sm:w-[min(92vw,980px)] sm:max-w-[980px]"
				>
					<DialogTitle className="sr-only">
						Preview {attachment.file.name}
					</DialogTitle>
					<div className="flex min-h-0 flex-col">
						<div className="grid min-w-0 grid-cols-[minmax(0,1fr)_32px] items-center gap-2 border-[#171B22] border-b px-3 py-2 sm:px-4 sm:py-3">
							<div className="min-w-0">
								<p className="truncate font-medium text-fg-primary text-sm">
									{attachment.file.name}
								</p>
								<p className="mt-0.5 text-[11px] text-fg-faint">
									{formatAttachmentSize(attachment.file.size)}
								</p>
							</div>
							<button
								type="button"
								onClick={() => setIsPreviewOpen(false)}
								className="flex size-8 items-center justify-center rounded-md text-fg-faint transition-colors hover:bg-[#111418] hover:text-fg-primary focus:outline-none focus:ring-2 focus:ring-[#3374FF]/40"
							>
								<XIcon className="size-4" />
								<span className="sr-only">Close preview</span>
							</button>
						</div>
						<div className="grid h-[min(58dvh,380px)] place-items-center bg-black px-4 py-5 sm:h-[min(76dvh,680px)] sm:px-6 sm:py-6">
							{objectUrl ? (
								<img
									src={objectUrl}
									alt={attachment.file.name}
									className="block max-h-full max-w-full rounded-lg object-contain"
									draggable={false}
								/>
							) : null}
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}

function DocumentFileGlyph({ label }: { label: string }) {
	return (
		<div className="relative flex size-6 items-end justify-center rounded-[4px] border border-[#30343B] bg-[#07090C] pb-1">
			<div className="absolute right-0 top-0 size-2.5 border-[#30343B] border-b border-l bg-black" />
			<span className="max-w-[22px] truncate text-[8px] font-bold uppercase leading-none text-[#AAB2BD]">
				{label}
			</span>
		</div>
	)
}

function getAttachmentExtension(file: File): string {
	const name = file.name
	const dotIndex = name.lastIndexOf(".")
	if (dotIndex > -1 && dotIndex < name.length - 1) {
		return name.slice(dotIndex + 1, dotIndex + 4)
	}
	if (file.type === "text/markdown") return "MD"
	if (file.type.includes("pdf")) return "PDF"
	if (file.type.startsWith("text/")) return "TXT"
	return "FILE"
}
