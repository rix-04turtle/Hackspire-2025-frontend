import { Loader2, Volume2 } from 'lucide-react'

const StatusDisplay = ({ isRecording, isProcessing, isPlaying, statusMessage, conversationHistory }) => (
    <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
            {isRecording && (
                <div className="flex gap-1">
                    <div className="w-1 h-8 bg-red-500 rounded animate-pulse" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1 h-8 bg-red-500 rounded animate-pulse" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1 h-8 bg-red-500 rounded animate-pulse" style={{ animationDelay: '300ms' }}></div>
                </div>
            )}
            {isProcessing && <Loader2 className="h-6 w-6 animate-spin text-green-600" />}
            {isPlaying && <Volume2 className="h-6 w-6 text-green-600 animate-pulse" />}
        </div>
        <p className="text-lg font-medium text-gray-800 mb-1">
            {statusMessage}
        </p>
        {conversationHistory.length > 0 && (
            <p className="text-sm text-gray-500">
                {conversationHistory.length / 2} questions asked
            </p>
        )}
    </div>
)

export default StatusDisplay
