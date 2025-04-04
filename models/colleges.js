import mongoose from 'mongoose';

const collegeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  location: { type: String, required: true },
  website: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  seatMatrixUrl: { type: String, required: true },
  imageUrl: { type: String, required: true }
});

const College = mongoose.model('College', collegeSchema);

export default College;