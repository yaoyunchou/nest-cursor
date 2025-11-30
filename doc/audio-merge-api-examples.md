# 音频合并接口使用示例

## 接口说明

### 接口1：上传并合并音频文件（文件上传方式）

- **接口地址**: `POST /api/v1/file/audio/merge`
- **请求类型**: `multipart/form-data`
- **认证**: 需要 JWT Token（Bearer Token）
- **参数名**: `files`（支持1-21个文件）
- **支持格式**: mp3、wav、m4a、aac

### 接口2：通过七牛云URL合并音频文件（URL方式）

- **接口地址**: `POST /api/v1/file/audio/merge-by-url`
- **请求类型**: `application/json`
- **认证**: 需要 JWT Token（Bearer Token）
- **参数**: `urls`（支持2-21个七牛云文件URL）
- **限制**: 所有文件必须位于同一七牛云存储空间

## 使用示例

### 1. cURL 命令示例

```bash
# 上传单个文件（直接上传，不合并）
curl -X POST "http://localhost:3000/api/v1/file/audio/merge" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "files=@/path/to/audio1.mp3"

# 上传多个文件（自动合并）
curl -X POST "http://localhost:3000/api/v1/file/audio/merge" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "files=@/path/to/audio1.mp3" \
  -F "files=@/path/to/audio2.mp3" \
  -F "files=@/path/to/audio3.wav"
```

### 2. JavaScript/TypeScript (Fetch API)

```typescript
// 上传单个文件
async function uploadSingleAudio(file: File, token: string) {
  const formData = new FormData();
  formData.append('files', file);

  const response = await fetch('http://localhost:3000/api/v1/file/audio/merge', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  return await response.json();
}

// 上传多个文件（自动合并）
async function uploadAndMergeAudios(files: File[], token: string) {
  const formData = new FormData();
  
  // 注意：多个文件使用相同的字段名 'files'
  files.forEach(file => {
    formData.append('files', file);
  });

  const response = await fetch('http://localhost:3000/api/v1/file/audio/merge', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  return await response.json();
}

// 使用示例
const audioFiles = [
  document.querySelector('#file1').files[0],
  document.querySelector('#file2').files[0],
  document.querySelector('#file3').files[0],
];

uploadAndMergeAudios(audioFiles, 'YOUR_JWT_TOKEN')
  .then(result => {
    console.log('上传成功:', result);
    console.log('文件URL:', result.url);
  })
  .catch(error => {
    console.error('上传失败:', error);
  });
```

### 3. JavaScript/TypeScript (Axios)

```typescript
import axios from 'axios';

// 上传单个文件
async function uploadSingleAudio(file: File, token: string) {
  const formData = new FormData();
  formData.append('files', file);

  const response = await axios.post(
    'http://localhost:3000/api/v1/file/audio/merge',
    formData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
}

// 上传多个文件（自动合并）
async function uploadAndMergeAudios(files: File[], token: string) {
  const formData = new FormData();
  
  // 注意：多个文件使用相同的字段名 'files'
  files.forEach(file => {
    formData.append('files', file);
  });

  const response = await axios.post(
    'http://localhost:3000/api/v1/file/audio/merge',
    formData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
}
```

### 4. React 组件示例

```tsx
import React, { useState } from 'react';
import axios from 'axios';

function AudioMergeUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert('请选择至少一个音频文件');
      return;
    }

    if (files.length > 21) {
      alert('最多只能上传21个文件');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const token = localStorage.getItem('token'); // 从本地存储获取token
      const response = await axios.post(
        'http://localhost:3000/api/v1/file/audio/merge',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setResult(response.data);
      alert('上传成功！');
    } catch (error) {
      console.error('上传失败:', error);
      alert('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept="audio/mpeg,audio/mp3,audio/wav,audio/m4a,audio/aac"
        onChange={handleFileChange}
      />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? '上传中...' : '上传并合并'}
      </button>
      {result && (
        <div>
          <p>文件URL: {result.url}</p>
          <audio controls src={result.url} />
        </div>
      )}
    </div>
  );
}

export default AudioMergeUpload;
```

### 5. Postman 使用说明

1. **设置请求方法**: 选择 `POST`
2. **设置请求URL**: `http://localhost:3000/api/v1/file/audio/merge`
3. **设置认证**:
   - 在 `Authorization` 标签页
   - 选择 `Bearer Token`
   - 输入你的 JWT Token
4. **设置请求体**:
   - 选择 `Body` 标签页
   - 选择 `form-data`
   - 添加字段：
     - Key: `files` (类型选择 `File`)
     - Value: 选择第一个音频文件
   - 如果需要上传多个文件：
     - 点击 `+` 添加新行
     - Key: `files` (类型选择 `File`)
     - Value: 选择第二个音频文件
     - 重复此步骤添加更多文件
5. **发送请求**: 点击 `Send`

### 6. 响应示例

```json
{
  "id": 123,
  "filename": "merged-1706001234567.mp3",
  "originalname": "merged-audio-1706001234567.mp3",
  "size": 5242880,
  "mimetype": "audio/mpeg",
  "url": "https://your-domain.com/coze/merged/1706001234567-abc123.mp3",
  "key": "coze/merged/1706001234567-abc123.mp3",
  "userId": 1,
  "createdAt": "2025-01-23T10:00:00.000Z",
  "updatedAt": "2025-01-23T10:00:00.000Z"
}
```

## 接口2：通过URL合并音频文件示例

### 1. cURL 命令示例

```bash
curl -X POST "http://localhost:3000/api/v1/file/audio/merge-by-url" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://your-domain.com/coze/audio1.mp3",
      "https://your-domain.com/coze/audio2.mp3",
      "https://your-domain.com/coze/audio3.wav"
    ]
  }'
```

### 2. JavaScript/TypeScript (Fetch API)

```typescript
async function mergeAudioByUrls(urls: string[], token: string) {
  const response = await fetch('http://localhost:3000/api/v1/file/audio/merge-by-url', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ urls }),
  });

  return await response.json();
}

// 使用示例
const audioUrls = [
  'https://your-domain.com/coze/audio1.mp3',
  'https://your-domain.com/coze/audio2.mp3',
  'https://your-domain.com/coze/audio3.wav',
];

mergeAudioByUrls(audioUrls, 'YOUR_JWT_TOKEN')
  .then(result => {
    console.log('合并成功:', result);
    console.log('文件URL:', result.url);
  })
  .catch(error => {
    console.error('合并失败:', error);
  });
```

### 3. JavaScript/TypeScript (Axios)

```typescript
import axios from 'axios';

async function mergeAudioByUrls(urls: string[], token: string) {
  const response = await axios.post(
    'http://localhost:3000/api/v1/file/audio/merge-by-url',
    { urls },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}
```

### 4. Postman 使用说明

1. **设置请求方法**: 选择 `POST`
2. **设置请求URL**: `http://localhost:3000/api/v1/file/audio/merge-by-url`
3. **设置认证**:
   - 在 `Authorization` 标签页
   - 选择 `Bearer Token`
   - 输入你的 JWT Token
4. **设置请求体**:
   - 选择 `Body` 标签页
   - 选择 `raw`
   - 选择 `JSON` 格式
   - 输入JSON数据：
     ```json
     {
       "urls": [
         "https://your-domain.com/coze/audio1.mp3",
         "https://your-domain.com/coze/audio2.mp3"
       ]
     }
     ```
5. **发送请求**: 点击 `Send`

## 注意事项

### 接口1（文件上传方式）

1. **文件数量限制**: 1-21个文件
2. **文件格式**: 仅支持 mp3、wav、m4a、aac 格式
3. **单个文件**: 如果只上传1个文件，会直接上传返回，不进行合并
4. **多个文件**: 如果上传2-21个文件，会先上传所有文件，然后自动合并成一个mp3文件
5. **合并时间**: 合并操作可能需要一些时间（最多60秒），接口会等待合并完成后再返回
6. **认证**: 必须提供有效的 JWT Token

### 接口2（URL方式）

1. **文件数量限制**: 2-21个文件URL
2. **URL要求**: 必须是七牛云存储空间中的文件URL
3. **存储空间限制**: 所有文件必须位于**同一七牛云存储空间**（这是七牛云的限制）
4. **URL格式**: 支持完整的七牛云文件URL，系统会自动从URL中提取文件key
5. **合并时间**: 合并操作可能需要一些时间（最多60秒），接口会等待合并完成后再返回
6. **认证**: 必须提供有效的 JWT Token
7. **优势**: 不需要重新上传文件，直接使用已存在的文件进行合并

## 错误处理

- `400 Bad Request`: 文件数量不符合要求、文件格式不支持等
- `401 Unauthorized`: 未提供或无效的 JWT Token
- `500 Internal Server Error`: 服务器内部错误、合并失败等

