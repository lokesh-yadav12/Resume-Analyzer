import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Copy, 
  Check, 
  ZoomIn, 
  ZoomOut,
  Eye,
  EyeOff
} from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';

const ResumePreview = ({ 
  extractedText, 
  fileName, 
  fileUrl,
  showFullText = false,
  className = '' 
}) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(showFullText);
  const [fontSize, setFontSize] = useState(14);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDownload = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 24));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 10));
  };

  const formatText = (text) => {
    if (!text) return '';
    
    // Split by double newlines to preserve paragraphs
    const paragraphs = text.split(/\n\n+/);
    
    return paragraphs.map((para, index) => (
      <p key={index} className="mb-4 leading-relaxed">
        {para.trim()}
      </p>
    ));
  };

  const previewText = expanded 
    ? extractedText 
    : extractedText?.substring(0, 500) + (extractedText?.length > 500 ? '...' : '');

  const wordCount = extractedText?.split(/\s+/).length || 0;
  const charCount = extractedText?.length || 0;

  return (
    <Card className={`${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Resume Preview</h3>
            {fileName && (
              <p className="text-sm text-gray-500">{fileName}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<ZoomOut className="w-4 h-4" />}
            onClick={decreaseFontSize}
            title="Decrease font size"
          />
          
          <span className="text-sm text-gray-600 px-2">
            {fontSize}px
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            icon={<ZoomIn className="w-4 h-4" />}
            onClick={increaseFontSize}
            title="Increase font size"
          />

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <Button
            variant="ghost"
            size="sm"
            icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            onClick={handleCopyText}
            title="Copy text"
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>

          {fileUrl && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={handleDownload}
              title="Download original"
            >
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="flex items-center space-x-6 mb-4 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <span className="font-medium">Words:</span>
          <span>{wordCount.toLocaleString()}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-medium">Characters:</span>
          <span>{charCount.toLocaleString()}</span>
        </div>
      </div>

      {/* Text Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-gray-50 rounded-lg p-6 max-h-[600px] overflow-y-auto"
        style={{ fontSize: `${fontSize}px` }}
      >
        {extractedText ? (
          <div className="text-gray-800 whitespace-pre-wrap font-mono">
            {formatText(previewText)}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No text extracted yet</p>
          </div>
        )}
      </motion.div>

      {/* Expand/Collapse Button */}
      {extractedText && extractedText.length > 500 && (
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            icon={expanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Show Less' : 'Show More'}
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ResumePreview;
