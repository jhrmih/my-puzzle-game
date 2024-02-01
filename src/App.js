import React, { useState } from 'react';
import ImageUpload from './ImageUpload';

const App = () => {
  const [size, setSize] = useState(3);
  const [pieces, setPieces] = useState([]);
  const [emptyIndex, setEmptyIndex] = useState(null);
  const [completed, setCompleted] = useState(false);

  const handleSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    if (newSize >= 3 && newSize <= 5) {
      setSize(newSize);
    }
  };
  
  const shufflePieces = (originalArray, size) => {
    setCompleted(false);

    let array = [...originalArray];
    let emptyPieceIndex = size * size - 1;
    array[emptyPieceIndex] = null;
    setEmptyIndex(emptyPieceIndex);

    // 셔플 로직 (2x2 퍼즐 포함)
    if (size === 2) {
      [array[0], array[1]] = [array[1], array[0]];
    } else {
      for (let i = array.length - 2; i > 0; i--) {
        const j = Math.floor(Math.random() * i);
        [array[i], array[j]] = [array[j], array[i]];
      }
    }
    return array;
  };

  const handleImageUpload = (imageData) => {
    const image = new Image();
    image.src = imageData;
    image.onload = () => {
      const tempPieces = sliceImageIntoPieces(image, size);
      setPieces(shufflePieces(tempPieces, size));
    };
  };

  const sliceImageIntoPieces = (image, size) => {
    const tempPieces = [];
    const pieceWidth = image.width / size;
    const pieceHeight = image.height / size;

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = pieceWidth;
        canvas.height = pieceHeight;

        ctx.drawImage(
          image, 
          x * pieceWidth, y * pieceHeight, 
          pieceWidth, pieceHeight, 
          0, 0, 
          pieceWidth, pieceHeight
        );

        const piece = {
          originalIndex: y * size + x,
          currentPosition: y * size + x,
          image: canvas.toDataURL()
        };

        tempPieces.push(piece);
      }
    }

    return tempPieces;
  };

  const canMove = (index) => {
    const row = Math.floor(index / size);
    const col = index % size;
    const emptyRow = Math.floor(emptyIndex / size);
    const emptyCol = emptyIndex % size;

    return (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
           (col === emptyCol && Math.abs(row - emptyRow) === 1);
  };

  const handlePieceClick = (index) => {
    if (canMove(index)) {
      let newPieces = [...pieces];
      [newPieces[emptyIndex], newPieces[index]] = [newPieces[index], newPieces[emptyIndex]];
      setEmptyIndex(index);
      setPieces(newPieces);
      checkCompletion(newPieces);
    }
  };

  const checkCompletion = (newPieces) => {
    const isCompleted = newPieces.every((piece, index) => {
      return piece === null || piece.originalIndex === index;
    });
    setCompleted(isCompleted);
  };

  return (
    <div>
      <h1>이미지 업로드 퍼즐 게임</h1>
      <div>
        <label>
          퍼즐 크기 (NxN): 
          <input type="number" value={size} onChange={handleSizeChange} min="3" max="5" />
        </label>
      </div>
      <ImageUpload onImageUpload={handleImageUpload} />
      <button onClick={() => setPieces(shufflePieces([...pieces], size))}>Shuffle</button>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${size}, 1fr)`, gridGap: '1px', maxWidth: '500px' }}>
        {pieces.map((piece, index) => (
          piece ? (
            <img
              key={index}
              src={piece.image}
              alt={`Piece ${index}`}
              onClick={() => handlePieceClick(index)}
              style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
            />
          ) : (
            <div key={index} style={{ backgroundColor: 'lightgray' }}></div>
          )
        ))}
      </div>
      {completed && <p>축하합니다! 퍼즐을 완성했습니다!</p>}
    </div>
  );
};

export default App;
