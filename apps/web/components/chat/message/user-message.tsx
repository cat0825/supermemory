"use client"

import { memo } from "react"
import { Copy, Check, FileIcon } from "lucide-react"
import type { UIMessage } from "@ai-sdk/react"
import { formatAttachmentSize, getChatMessageAttachments } from "../attachments"

interface UserMessageProps {
	message: UIMessage
	copiedMessageId: string | null
	onCopy: (messageId: string, text: string) => void
}

export const UserMessage = memo(function UserMessage({
	message,
	copiedMessageId,
	onCopy,
}: UserMessageProps) {
	const text = message.parts
		.filter((part) => part.type === "text")
		.map((part) => part.text)
		.join(" ")
	const attachments = getChatMessageAttachments(message.metadata)

	return (
		<div className="flex flex-col items-end w-full">
			<div className="bg-[#1B1F24] rounded-[12px] p-3 px-[14px] max-w-[80%]">
				{text ? <p className="text-sm text-white">{text}</p> : null}
				{attachments.length > 0 ? (
					<div
						className={
							text ? "mt-2 flex flex-col gap-1.5" : "flex flex-col gap-1.5"
						}
					>
						{attachments.map((attachment) => (
							<div
								key={attachment.id}
								className="flex min-w-0 items-center gap-2 rounded-lg border border-[#303949] bg-[#0D121A]/80 px-2.5 py-2 text-left"
							>
								<div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[#111A27]">
									<FileIcon className="size-3.5 text-[#8FC3FF]" />
								</div>
								<div className="min-w-0">
									<div className="truncate text-xs font-medium text-white">
										{attachment.filename}
									</div>
									<div className="truncate text-[11px] text-white/50">
										{formatAttachmentSize(attachment.size)}
										{" · "}
										{attachment.saveToMemory ? "Saved" : "Chat only"}
									</div>
								</div>
							</div>
						))}
					</div>
				) : null}
			</div>
			<button
				type="button"
				onClick={() => onCopy(message.id, text)}
				className="p-1.5 hover:bg-[#293952]/40 rounded transition-colors mt-1"
				title="Copy message"
			>
				{copiedMessageId === message.id ? (
					<Check className="size-3.5 text-green-400" />
				) : (
					<Copy className="size-3.5 text-white/50" />
				)}
			</button>
		</div>
	)
})
