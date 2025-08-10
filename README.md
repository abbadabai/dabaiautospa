# Dabai Auto Spa Website

A professional car wash and detailing services website for Dabai Auto Spa located in Zaria, Kaduna State, Nigeria.

## Features

- **Service Booking System**: Complete appointment booking with state/local government selection
- **Interactive Map**: Google Maps integration showing your location in Zaria
- **Responsive Design**: Mobile-friendly interface
- **Theme Toggle**: Light/dark mode switching
- **Booking Management**: View and track your appointments

## Setup Instructions

### 1. Google Maps API Key Setup

To enable the interactive map functionality, you need to:

1. **Get a Google Maps API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the "Maps JavaScript API" and "Places API"
   - Go to "Credentials" and create an API key
   - Restrict the API key to your domain for security

2. **Update the API Key**:
   Replace `YOUR_GOOGLE_MAPS_API_KEY` in these files with your actual API key:
   - `index.html` (line 9)
   - `services.html` (line 12)
   - `contact.html` (line 12)

   Example:
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB...&libraries=places"></script>
   ```

### 2. Location Information

The map is configured to show your location at:
- **Address**: Basawa Road, Zaria, Kaduna State, Nigeria
- **Coordinates**: Latitude: 11.1112, Longitude: 7.7227

### 3. Testing the Map

1. After adding your API key, refresh the pages with maps
2. The map should display your location in Zaria with a marker
3. Click the marker to see location details
4. If the API key is invalid, a fallback display will show your address

## File Structure

- `index.html` - Home page with map
- `services.html` - Services and booking form with map
- `contact.html` - Contact information with map
- `booking.html` - Booking status and management
- `script.js` - Main JavaScript functionality
- `style.css` - Styling and themes

## Troubleshooting

### Map Not Loading
- Check if you have a valid Google Maps API key
- Ensure the API key is not restricted to wrong domains
- Check browser console for error messages
- Verify that the Maps JavaScript API is enabled in Google Cloud Console

### Booking Issues
- Check browser console for JavaScript errors
- Ensure localStorage is enabled in your browser
- Verify that all required form fields are filled

## Support

For technical support or questions about the website functionality, please contact the development team. 