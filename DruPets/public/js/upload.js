// CONFIGURAÇÕES DO CLOUDINARY
const CLOUD_NAME = "dbsp8poyk";
const UPLOAD_PRESET = "DruPets";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

// Função exportada para ser usada em qualquer outro script
export async function uploadFotoAnimal(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
        const response = await fetch(CLOUDINARY_URL, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        // Verifica se o upload falhou (ex: erro de preset ou tamanho)
        if (data.error) {
            console.error("Erro no upload do Cloudinary:", data.error.message);
            return null;
        }

        // Retorna a URL segura para salvar no Firebase
        return data.secure_url;
    } catch (error) {
        console.error("Erro de rede ao conectar ao Cloudinary:", error);
        return null;
    }
}