import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Button,
  Chip,
  Alert,
} from '@mui/material';
import {
  Description,
  PictureAsPdf,
  Image as ImageIcon,
  Visibility,
  Download,
  Delete,
} from '@mui/icons-material';
import { DocumentPreviewDialog } from '../../quotes/components/document-preview-dialog';
import { useGetOrderDocumentsQuery, useDeleteOrderDocumentMutation } from '../salesApi';

interface OrderDocument {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  previewUrl: string;
  downloadUrl: string;
  uploadedAt: string;
  documentType: string;
  description?: string;
  refType: string;
  refId: number;
}

interface OrderDocumentDisplayProps {
  orderId: number;
  onDocumentDeleted?: () => void;
}

const DOCUMENT_TYPE_LABELS = {
  deposit_receipt: 'Deposit Receipt',
  final_payment_receipt: 'Final Payment Receipt',
  pd_report: 'PD Report',
  shipping_doc: 'Shipping Document',
  delivery_confirmation: 'Delivery Confirmation',
  payment_proof: 'Payment Proof',
  contract: 'Contract',
  invoice: 'Invoice',
  general: 'General'
};

const OrderDocumentDisplay: React.FC<OrderDocumentDisplayProps> = ({ 
  orderId, 
  onDocumentDeleted 
}) => {
  const [selectedDocument, setSelectedDocument] = useState<OrderDocument | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // RTK Query hooks
  const { 
    data: documentsResponse, 
    error, 
    isLoading: loading,
    refetch 
  } = useGetOrderDocumentsQuery(orderId);
  
  const [deleteDocument] = useDeleteOrderDocumentMutation();

  // Helper function to get file type from file name
  const getFileTypeFromName = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'application/pdf';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'xls':
        return 'application/vnd.ms-excel';
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default:
        return 'application/octet-stream';
    }
  };

  // Transform the response data to match the expected format
  const documents: OrderDocument[] = React.useMemo(() => {
    if (!documentsResponse?.data) return [];
    
    return documentsResponse.data.map((doc: any) => ({
      id: doc.id,
      fileName: doc.fileName,
      fileType: doc.fileType || getFileTypeFromName(doc.fileName),
      fileSize: doc.fileSize,
      url: doc.fileUrl || doc.filePath,
      previewUrl: doc.fileUrl || doc.filePath,
      downloadUrl: doc.fileUrl || doc.filePath,
      uploadedAt: doc.uploadedAt,
      documentType: doc.documentType,
      description: doc.description,
      refType: 'order',
      refId: orderId
    }));
  }, [documentsResponse, orderId]);


  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon />;
    } else if (fileType === 'application/pdf') {
      return <PictureAsPdf />;
    }
    return <Description />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePreview = (document: OrderDocument) => {
    setSelectedDocument(document);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setSelectedDocument(null);
  };

  const handleDownload = (document: OrderDocument) => {
    window.open(document.downloadUrl, '_blank');
  };

  const handleDelete = async (documentId: number) => {
    try {
      await deleteDocument(documentId).unwrap();
      onDocumentDeleted?.();
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  const getDocumentTypeLabel = (type: string): string => {
    return DOCUMENT_TYPE_LABELS[type as keyof typeof DOCUMENT_TYPE_LABELS] || type;
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading documents...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error && typeof error === 'object' && 'message' in error 
          ? (error as any).message 
          : 'Failed to load documents'}
      </Alert>
    );
  }

  if (documents.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No documents uploaded yet
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Order Documents ({documents.length})
        </Typography>
        
        <Grid container spacing={2}>
          {documents.map((document) => (
            <Grid item xs={12} sm={6} md={4} key={document.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    {getFileIcon(document.fileType)}
                    <Typography
                      variant="subtitle2"
                      sx={{ ml: 1, fontWeight: 'bold' }}
                      noWrap
                    >
                      {document.fileName}
                    </Typography>
                  </Box>
                  
                  <Chip
                    label={getDocumentTypeLabel(document.documentType)}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Size: {formatFileSize(document.fileSize)}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
                  </Typography>
                  
                  {document.description && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {document.description}
                    </Typography>
                  )}
                  
                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => handlePreview(document)}
                    >
                      Preview
                    </Button>
                    
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleDownload(document)}
                        title="Download"
                      >
                        <Download />
                      </IconButton>
                      
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(document.id)}
                        title="Delete"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Preview Dialog */}
      <DocumentPreviewDialog
        document={selectedDocument}
        isOpen={previewOpen}
        onClose={handleClosePreview}
      />
    </>
  );
};

export default OrderDocumentDisplay;