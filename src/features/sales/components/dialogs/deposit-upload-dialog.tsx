import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Alert,
  LinearProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { CloudUpload, AttachFile, Delete, Close } from '@mui/icons-material';
import { orderApi } from '../../../../api/orderApi';

interface DepositUploadDialogProps {
  open: boolean;
  onClose: () => void;
  orderId: number;
  onSuccess?: () => void;
}

interface UploadFile {
  file: File;
  id: string;
}

const DepositUploadDialog: React.FC<DepositUploadDialogProps> = ({
  open,
  onClose,
  orderId,
  onSuccess
}) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const newFiles = acceptedFiles.map(file => ({
        file,
        id: Math.random().toString(36).substr(2, 9)
      }));
      setFiles(prev => [...prev, ...newFiles]);
      setError(null);
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5
  });

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError('Please upload at least one deposit receipt or proof of payment.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((uploadFile, index) => {
        formData.append(`files`, uploadFile.file);
      });
      formData.append('orderId', orderId.toString());
      formData.append('documentType', 'deposit_receipt');
      formData.append('notes', notes);

      // First upload the documents
      const uploadResponse = await fetch('/api/orders/upload-documents', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload documents');
      }

      // Then mark deposit as received
      await orderApi.processDepositPayment(orderId);

      onSuccess?.();
      onClose();
      
      // Reset form
      setFiles([]);
      setNotes('');
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFiles([]);
      setNotes('');
      setError(null);
      onClose();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={uploading}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            Upload Deposit Receipt
          </Typography>
          <IconButton onClick={handleClose} disabled={uploading}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Please upload proof of deposit payment (receipts, bank transfers, screenshots, etc.)
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* File Upload Area */}
        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            borderRadius: 2,
            p: 3,
            mb: 2,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: isDragActive ? 'action.hover' : 'background.paper',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover'
            }
          }}
        >
          <input {...getInputProps()} />
          <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
          <Typography variant="h6" gutterBottom>
            {isDragActive ? 'Drop files here...' : 'Drag & drop files here'}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            or click to browse files
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Supported: PDF, DOC, DOCX, PNG, JPG (Max 10MB each, up to 5 files)
          </Typography>
        </Box>

        {/* File List */}
        {files.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected Files ({files.length})
            </Typography>
            <List dense>
              {files.map((uploadFile) => (
                <ListItem key={uploadFile.id} divider>
                  <AttachFile sx={{ mr: 1, color: 'grey.600' }} />
                  <ListItemText
                    primary={uploadFile.file.name}
                    secondary={formatFileSize(uploadFile.file.size)}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => removeFile(uploadFile.id)}
                      disabled={uploading}
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Notes Field */}
        <TextField
          fullWidth
          label="Notes (Optional)"
          placeholder="Add any additional notes about the deposit payment..."
          multiline
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={uploading}
          sx={{ mb: 2 }}
        />

        {uploading && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Uploading documents and processing payment...
            </Typography>
            <LinearProgress />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={uploading || files.length === 0}
          startIcon={<CloudUpload />}
        >
          {uploading ? 'Processing...' : 'Upload & Mark Received'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DepositUploadDialog;