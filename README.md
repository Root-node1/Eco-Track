# Carbon Footprint Predictor

This model predicts future carbon footprints (kg CO2e) based on historical user activity and behavioral profiles.

## Model Details
- **Algorithm**: Random Forest Regressor
- **Features**:
  1. `lag_1_day_footprint`: The total footprint from the previous day.
  2. `rolling_7_day_avg_footprint`: Average footprint over the last week.
  3. `user_type_encoded`: Profile code (0: Eco-Warrior, 1: Heavy Emitter).

## Setup & Installation
1. Ensure you have the model file `carbon_footprint_predictor.joblib` in your directory.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage (Terminal)
Run the prediction script by passing the three required features as arguments:
```bash
python predict.py <lag_1_day> <rolling_7_avg> <user_type_code>
```

**Example:**
```bash
python predict.py 30.0 28.5 1
```