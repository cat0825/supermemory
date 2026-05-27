"use client"

import {
	CheckIcon,
	ChevronUpIcon,
	Loader2Icon,
	PaperclipIcon,
	RotateCcwIcon,
	XIcon,
} from "lucide-react"
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
	onToggleAttachmentSave: _onToggleAttachmentSave,
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
		<div className="scrollbar-none flex gap-2 overflow-x-auto px-1 pb-1">
			{attachments.map((attachment) => {
				return (
					<AttachmentPreviewChip
						key={attachment.id}
						attachment={attachment}
						onRemove={onRemoveAttachment}
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
				className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-surface-border bg-surface-card text-[#A6B0BE] transition-colors hover:bg-surface-hover hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
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
	onRetry,
}: {
	attachment: ChatAttachmentDraft
	onRemove?: (id: string) => void
	onRetry?: (id: string) => void
}) {
	const [objectUrl, setObjectUrl] = useState<string | null>(null)
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
		<div
			className={cn(
				"group flex h-11 min-w-[220px] max-w-[min(290px,78vw)] shrink-0 items-center gap-2 rounded-xl border border-surface-border bg-surface-card px-2 text-sm text-fg-primary shadow-[0_6px_18px_rgba(0,0,0,0.16)]",
				isError && "border-red-400/40 bg-red-950/20",
			)}
			title={statusLabel}
		>
			<div className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-surface-border bg-surface-base">
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
					<div className="absolute inset-0 flex items-center justify-center bg-black/55">
						{isUploading ? (
							<Loader2Icon className="size-3.5 animate-spin text-brand-accent" />
						) : (
							<CheckIcon className="size-3.5 text-emerald-400" />
						)}
					</div>
				) : null}
			</div>
			<div
				className="min-w-0 flex-1 truncate font-medium leading-none text-fg-primary"
				title={attachment.file.name}
			>
				{attachment.file.name}
			</div>
			{isError ? (
				<button
					type="button"
					onClick={() => onRetry?.(attachment.id)}
					className="flex size-7 shrink-0 items-center justify-center rounded-md text-fg-faint transition-colors hover:bg-surface-hover hover:text-fg-primary"
					aria-label={`Retry ${attachment.file.name}`}
					title={statusLabel}
				>
					<RotateCcwIcon className="size-3.5" />
				</button>
			) : null}
			<button
				type="button"
				onClick={() => onRemove?.(attachment.id)}
				disabled={isUploading}
				className="flex size-7 shrink-0 items-center justify-center rounded-md text-fg-faint transition-colors hover:bg-surface-hover hover:text-fg-primary disabled:cursor-not-allowed disabled:opacity-50"
				aria-label={`Remove ${attachment.file.name}`}
			>
				<XIcon className="size-4" />
			</button>
		</div>
	)
}

function DocumentFileGlyph({ label }: { label: string }) {
	return (
		<div className="relative flex size-6 items-end justify-center rounded-[4px] border border-surface-border bg-surface-card pb-1">
			<div className="absolute right-0 top-0 size-2.5 border-surface-border border-b border-l bg-surface-base" />
			<span className="max-w-[22px] truncate text-[8px] font-bold uppercase leading-none text-fg-faint">
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
