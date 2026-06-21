import joblib
import pandas as pd
import sys

def make_prediction(lag_1, rolling_7, user_type_code):
    # Load the model
    model = joblib.load('carbon_footprint_predictor.joblib')
    
    # Prepare input in the correct format/order
    input_data = pd.DataFrame([
        {
            'lag_1_day_footprint': float(lag_1),
            'rolling_7_day_avg_footprint': float(rolling_7),
            'user_type_encoded': int(user_type_code)
        }
    ])
    
    # Make prediction
    prediction = model.predict(input_data)
    return prediction[0]

if __name__ == '__main__':
    # Quick command line test
    if len(sys.argv) == 4:
        res = make_prediction(sys.argv[1], sys.argv[2], sys.argv[3])
        print(f'Predicted Carbon Footprint: {res:.2f} kg CO2e')
    else:
        print('Usage: python predict.py <lag_1_day> <rolling_7_avg> <user_type_code>')
        print('Example: python predict.py 25.5 22.0 1')