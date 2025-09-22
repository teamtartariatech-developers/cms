class MockStorageService {
  private files: Map<string, string> = new Map();

  async upload(path: string, file: File) {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create a mock URL for the uploaded file
    const mockUrl = `https://mock-storage.com/${path}`;
    this.files.set(path, mockUrl);
    
    return { error: null };
  }

  getPublicUrl(path: string) {
    const url = this.files.get(path) || `https://mock-storage.com/${path}`;
    return { data: { publicUrl: url } };
  }
}

export const mockStorage = {
  from: (bucket: string) => new MockStorageService()
};