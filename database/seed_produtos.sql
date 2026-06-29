-- ============================================================
-- RATAPLAM - Seed de Produtos (MariaDB/InnoDB)
-- Loja de roupas infantis
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

-- ============================================================
-- CATEGORIAS
-- ============================================================
INSERT IGNORE INTO categorias (id, nome, slug, descricao, ativo) VALUES
(1, 'Macacoes', 'macacoes', 'Macacoes infantis para todas as idades. Estampas divertidas e tecidos de alta qualidade para o conforto do seu pequeno.', 1),
(2, 'Bermudas', 'bermudas', 'Bermudas para meninos e meninas. Modelos casuais e estampados para o dia a dia com muito estilo.', 1),
(3, 'Blusas', 'blusas', 'Blusas infantis com estampas criativas. Tecidos leves e macios para o conforto no dia a dia.', 1),
(4, 'Biquinis', 'biquinis', 'Biquinis infantis com protecao UV. Modelos coloridos e divertidos para os dias de praia e piscina.', 1),
(5, 'Calcas', 'calcas', 'Calcas infantis para todas as occasions. Modelos confortaveis e estilosos para meninos e meninas.', 1),
(6, 'Acessorios', 'acessorios', 'Acessorios infantis para completar o look. Sapatos, toalhas e muito mais.', 1);

-- ============================================================
-- FAIXAS ETARIAS
-- ============================================================
INSERT IGNORE INTO faixas_etarias (id, nome, slug, faixa_min, faixa_max, ativo) VALUES
(1, '0 a 1 ano', '0-a-1', 0, 1, 1),
(2, '1 a 3 anos', '1-a-3', 1, 3, 1),
(3, '4 a 8 anos', '4-a-8', 4, 8, 1),
(4, '10 a 14 anos', '10-a-14', 10, 14, 1);

-- ============================================================
-- PRODUTOS - MACACOES
-- ============================================================
INSERT IGNORE INTO produtos (id, nome, slug, descricao, descricao_curta, preco, preco_promocional, estoque, estoque_minimo, sku, categoria_id, faixa_etaria_id, genero, destaque, ativo, imagem, created_at) VALUES
(1, 'Macacao Cachorro', 'macacao-cachorro',
 'Macacao infantil com estampa de cachorrinho fofo. Tecido 100% algodao, super macio e confortavel. Perfeito para o dia a dia do seu pequeno.',
 'Macacao com estampa de cachorrinho em algodao macio.',
 94.90, 66.43, 20, 5, 'MAC-001', 1, 2, 'F', 1, 1,
 'https://static.wixstatic.com/media/e23129_e7615472cc5d4c2b8eae2d876d360ea3~mv2.jpg', NOW()),

(2, 'Macacao Nemo', 'macacao-nemo',
 'Macacao com estampa do peixinho Nemo. Ideal para os amantes do mar. Feito com algodao de alta qualidade e costuras reforcadas.',
 'Macacao estampado peixinho Nemo em algodao.',
 82.90, NULL, 20, 5, 'MAC-002', 1, 2, 'U', 0, 1,
 'https://static.wixstatic.com/media/e23129_b887b8b44bd743749d0eeb3740846160~mv2.png', NOW()),

(3, 'Macacao Selva', 'macacao-selva',
 'Macacao com estampa de animais da selva. Design selvagem e divertido para os pequenos aventureiros. Tecido respiravel e confortavel.',
 'Macacao com estampa de animais da selva.',
 137.90, 96.53, 20, 5, 'MAC-003', 1, 2, 'M', 0, 1,
 'https://static.wixstatic.com/media/e23129_74b957d328f247a7b23710257ada6d72~mv2.jpg', NOW()),

(4, 'Macacao Abelhas', 'macacao-abelhas',
 'Macacao com estampa de abelhinhas fofas. Cores vibrantes que encantam as criancas. Algodao organico e hipoalergenico.',
 'Macacao com estampa de abelhinhas coloridas.',
 137.90, NULL, 20, 5, 'MAC-004', 1, 2, 'U', 1, 1,
 'https://static.wixstatic.com/media/e23129_2b6fe52a59b6476489ffcc8ab89f1d26~mv2.jpg', NOW()),

(5, 'Macacao Flor', 'macacao-flor',
 'Macacao com estampa de flores delicadas. Perfeito para as pequenas princesas. Tecido macio com toque suave na pele.',
 'Macacao com estampa de flores delicadas.',
 137.90, 96.53, 20, 5, 'MAC-005', 1, 2, 'F', 0, 1,
 'https://static.wixstatic.com/media/e23129_f79ab3a2adbf422688d67c74c5fe310e~mv2.jpg', NOW()),

(6, 'Macacao Leo', 'macacao-leo',
 'Macacao com estampa de leozinho corajoso. Design divertido e colorido. Costuras internas acabamento premium.',
 'Macacao com estampa de leozinho.',
 136.90, NULL, 20, 5, 'MAC-006', 1, 2, 'M', 0, 1,
 'https://static.wixstatic.com/media/e23129_8c17f9d8d0b84941b481ead424bd1f47~mv2.jpg', NOW()),

(7, 'Macacao Transportes', 'macacao-transportes',
 'Macacao com estampa de carros e caminhoes. Para os pequenos motoristas. Algodao de primeira qualidade e durabilidade garantida.',
 'Macacao com estampa de transportes.',
 148.90, 104.23, 20, 5, 'MAC-007', 1, 3, 'M', 0, 1,
 'https://static.wixstatic.com/media/e23129_e1c6f0fdc901424380ad3f6962da5790~mv2.jpg', NOW()),

(8, 'Macacao Cogumelo', 'macacao-cogumelo',
 'Macacao com estampa de cogumelos encantados. Design kawaii que as criancas adoram. Material resistente e lavavel.',
 'Macacao com estampa de cogumelos.',
 137.90, NULL, 20, 5, 'MAC-008', 1, 2, 'F', 0, 1,
 'https://static.wixstatic.com/media/e23129_de1131cc9a0f4e17a65d1167862b272f~mv2.jpg', NOW());

-- ============================================================
-- PRODUTOS - BERMUDAS
-- ============================================================
INSERT IGNORE INTO produtos (id, nome, slug, descricao, descricao_curta, preco, preco_promocional, estoque, estoque_minimo, sku, categoria_id, faixa_etaria_id, genero, destaque, ativo, imagem, created_at) VALUES
(9, 'Bermuda Cuca', 'bermuda-cuca',
 'Bermuda infantil com estampa Cuca da Turma da Monica. Tecido leve e respiravel para os dias quentes. Borracha elástica na cintura.',
 'Bermuda com estampa Cuca da Turma da Monica.',
 21.90, NULL, 20, 5, 'BER-001', 2, 1, 'F', 0, 1,
 'https://static.wixstatic.com/media/e23129_e3e2e9d028cd4294ab7481def8d38e67~mv2.jpg', NOW()),

(10, 'Bermuda Bob', 'bermuda-bob',
 'Bermuda Bob Esponja Calca Quadrados. Design icônico e divertido. Perfeito para brincar na praia ou na piscina.',
 'Bermuda Bob Esponja Calca Quadrados.',
 62.90, NULL, 20, 5, 'BER-002', 2, 2, 'M', 0, 1,
 'https://static.wixstatic.com/media/e23129_9af53e673f1645cca566a3b4da4a255a~mv2.jpg', NOW()),

(11, 'Bermuda Gamer', 'bermuda-gamer',
 'Bermuda com estampa gamer para os pequenos jogadores. Modelagem confortavel com bolsos laterais. Tecido resistente e lavavel.',
 'Bermuda gamer com estampa de controles.',
 109.90, 76.93, 20, 5, 'BER-003', 2, 3, 'M', 1, 1,
 'https://static.wixstatic.com/media/e23129_b2f0113bbe3e41d0ba70f79615ecdb34~mv2.jpg', NOW()),

(12, 'Bermuda Kayke', 'bermuda-kayke',
 'Bermuda estampada Kayke com listras modernas. Cintura ajustavel com elástico e cordao. Conforto e estilo para o dia a dia.',
 'Bermuda Kayke com estampa moderna.',
 84.90, NULL, 20, 5, 'BER-004', 2, 3, 'M', 0, 1,
 'https://static.wixstatic.com/media/e23129_6d6e81038be24785b5ef27bd8f75dfbd~mv2.jpg', NOW()),

(13, 'Bermuda Tropical', 'bermuda-tropical',
 'Bermuda com estampa tropical de folhas e flores. Perfeira para o verao. Algodao de alta qualidade com toque suave.',
 'Bermuda com estampa tropical.',
 132.90, 93.03, 20, 5, 'BER-005', 2, 3, 'U', 0, 1,
 'https://static.wixstatic.com/media/e23129_41db3354d3834c6ab8815821e5817913~mv2.jpg', NOW()),

(14, 'Bermuda Andes', 'bermuda-andes',
 'Bermuda com estampa de montanhas Andes. Design aventureiro para os pequenos exploradores. Costuras reforcadas e acabamento premium.',
 'Bermuda com estampa de montanhas.',
 102.90, NULL, 20, 5, 'BER-006', 2, 3, 'M', 0, 1,
 'https://static.wixstatic.com/media/e23129_97d7598849bd4c23ba1d17b34655986f~mv2.jpg', NOW()),

(15, 'Bermuda Posi', 'bermuda-posi',
 'Bermuda com estampa Posi Pinguim. Personagem querido pelas criancas. Material confortavel e duravel para brincar o dia todo.',
 'Bermuda com estampa Posi Pinguim.',
 134.90, NULL, 20, 5, 'BER-007', 2, 2, 'F', 0, 1,
 'https://static.wixstatic.com/media/e23129_fb1d4642681b4470b8027ac4a0c6719f~mv2.jpg', NOW()),

(16, 'Bermuda Cena', 'bermuda-cena',
 'Bermuda estampada Cena com motivos nauticos. Ideal para os dias de sol. Cintura com elástico para melhor ajuste.',
 'Bermuda com estampa nautica.',
 112.90, 79.03, 20, 5, 'BER-008', 2, 3, 'M', 0, 1,
 'https://static.wixstatic.com/media/e23129_1f48088945c3460a9f4c4503557899d2~mv2.jpg', NOW());

-- ============================================================
-- PRODUTOS - BLUSAS
-- ============================================================
INSERT IGNORE INTO produtos (id, nome, slug, descricao, descricao_curta, preco, preco_promocional, estoque, estoque_minimo, sku, categoria_id, faixa_etaria_id, genero, destaque, ativo, imagem, created_at) VALUES
(17, 'Blusa Friends Trip', 'blusa-friends-trip',
 'Blusa com estampa Friends Trip para viagens divertidas. Tecido 100% algodao, macio e respiravel. Design moderno e confortavel.',
 'Blusa com estampa Friends Trip.',
 47.90, NULL, 20, 5, 'BLU-001', 3, 3, 'F', 0, 1,
 'https://static.wixstatic.com/media/e23129_c8f4906b9df04133a3121e86e1753485~mv2.png', NOW()),

(18, 'Blusa Princesa Vet', 'blusa-princesa-vet',
 'Blusa com estampa Princesa Veterinaria. Para as pequenas que amam animais. Algodao hipoalergenico e muito macio.',
 'Blusa com estampa Princesa Veterinaria.',
 36.90, NULL, 20, 5, 'BLU-002', 3, 2, 'F', 0, 1,
 'https://static.wixstatic.com/media/e23129_5d04da23343b4b4385e581f897b0fb0c~mv2.png', NOW()),

(19, 'Blusa Senso', 'blusa-senso',
 'Blusa com estampa Senso Minimalista. Design clean e moderno. Perfeita para usar no dia a dia ou em ocasioes especiais.',
 'Blusa com estampa minimalista.',
 36.90, 25.83, 20, 5, 'BLU-003', 3, 3, 'M', 0, 1,
 'https://static.wixstatic.com/media/e23129_3e6d2b54963a4de490ffc5d7931e0129~mv2.png', NOW()),

(20, 'Blusa Underwater', 'blusa-underwater',
 'Blusa com estampa subaquatica de peixes e corais. Para os amantes do oceano. Tecido leve ideal para o verao.',
 'Blusa com estampa subaquatica.',
 42.90, NULL, 20, 5, 'BLU-004', 3, 3, 'M', 0, 1,
 'https://static.wixstatic.com/media/e23129_0528cd9294774695afd4c715b9cfac4e~mv2.png', NOW()),

(21, 'Blusa Stingray', 'blusa-stingray',
 'Blusa com estampa de arraia marinha. Design moderno e divertido. Algodao de primeira qualidade com acabamento impecavel.',
 'Blusa com estampa de arraia.',
 39.90, NULL, 20, 5, 'BLU-005', 3, 3, 'M', 0, 1,
 'https://static.wixstatic.com/media/e23129_59cad455a5fc43b1b158bc667d87f3cf~mv2.png', NOW()),

(22, 'Blusa Seahorse', 'blusa-seahorse',
 'Blusa com estampa de cavalo-marinho. Cores vibrantes que encantam. Costuras internas acabamento premium.',
 'Blusa com estampa de cavalo-marinho.',
 44.90, 31.43, 20, 5, 'BLU-006', 3, 2, 'F', 0, 1,
 'https://static.wixstatic.com/media/e23129_af9b087ff9264380a6b608aeb49ac10d~mv2.png', NOW()),

(23, 'Blusa Pranchas', 'blusa-pranchas',
 'Blusa com estampa de pranchas de surf. Para os pequenos surfistas. Material resistente e lavavel na maquina.',
 'Blusa com estampa de surf.',
 51.90, NULL, 20, 5, 'BLU-007', 3, 3, 'M', 0, 1,
 'https://static.wixstatic.com/media/e23129_76cb0ded2acf4e69827afa54885800dc~mv2.png', NOW()),

(24, 'Blusa Water Melon', 'blusa-water-melon',
 'Blusa com estampa de watermelon refrescante. Perfeita para o verao. Tecido macio com toque suave na pele.',
 'Blusa com estampa de watermelon.',
 46.90, NULL, 20, 5, 'BLU-008', 3, 3, 'F', 1, 1,
 'https://static.wixstatic.com/media/e23129_1b246149da584477aa707be95052ffdc~mv2.png', NOW());

-- ============================================================
-- PRODUTOS - BIQUINIS
-- ============================================================
INSERT IGNORE INTO produtos (id, nome, slug, descricao, descricao_curta, preco, preco_promocional, estoque, estoque_minimo, sku, categoria_id, faixa_etaria_id, genero, destaque, ativo, imagem, created_at) VALUES
(25, 'Biquini Liana', 'biquini-liana',
 'Biquini infantil Liana com estampa floral delicada. Protecao UV 50+. Tecido de alta qualidade resistente a cloro e sal.',
 'Biquini floral com protecao UV.',
 104.90, 73.43, 20, 5, 'BIQ-001', 4, 3, 'F', 0, 1,
 'https://static.wixstatic.com/media/e23129_8165b0bff17049beb94aa0d3359b9bbd~mv2.png', NOW()),

(26, 'Biquini Arco Iris', 'biquini-arco-iris',
 'Biquini infantil Arco Iris com cores vibrantes. Modelagem confortavel com protecao UV. Perfeito para praia e piscina.',
 'Biquini colorido arco iris com protecao UV.',
 99.90, 69.93, 20, 5, 'BIQ-002', 4, 3, 'F', 1, 1,
 'https://static.wixstatic.com/media/e23129_737c53255a274fe498382720f4118369~mv2.png', NOW()),

(27, 'Biquini UV Primavera', 'biquini-uv-primavera',
 'Biquini infantil UV Primavera com estampa de flores. Protecao solar integrada. Material elástico e resistente.',
 'Biquini com estampa primaveril e protecao UV.',
 96.90, NULL, 20, 5, 'BIQ-003', 4, 2, 'F', 0, 1,
 'https://static.wixstatic.com/media/e23129_cde85af6f1ea45f88f374705bf070490~mv2.jpg', NOW());

-- ============================================================
-- PRODUTOS - CALCAS
-- ============================================================
INSERT IGNORE INTO produtos (id, nome, slug, descricao, descricao_curta, preco, preco_promocional, estoque, estoque_minimo, sku, categoria_id, faixa_etaria_id, genero, destaque, ativo, imagem, created_at) VALUES
(28, 'Calca Bento', 'calca-bento',
 'Calca infantil Bento jeans macia. Modelagem classica com cintura ajustavel. Algodao de alta qualidade e costuras resistentes.',
 'Calca jeans macia com cintura ajustavel.',
 139.90, 97.93, 20, 5, 'CAL-001', 5, 3, 'M', 1, 1,
 'https://static.wixstatic.com/media/e23129_10c8ee98b97b48da930b65d821c3a821~mv2.png', NOW()),

(29, 'Calca Run', 'calca-run',
 'Calca run esportiva para criancas ativas. Tecido tecnico com elasticidade. Perfeita para brincar e praticar esportes.',
 'Calca esportiva tecnica e elastica.',
 119.90, 83.93, 20, 5, 'CAL-002', 5, 3, 'M', 0, 1,
 'https://static.wixstatic.com/media/e23129_25091f246e5846bb983ba44c36c2bbec~mv2.png', NOW()),

(30, 'Calca Practice', 'calca-practice',
 'Calca practice confortavel para o dia a dia. Modelagem solta com elástico na cintura. Material respiravel e duravel.',
 'Calca practice confortavel e respiravel.',
 82.90, NULL, 20, 5, 'CAL-003', 5, 2, 'F', 0, 1,
 'https://static.wixstatic.com/media/e23129_fdbd4bb2588f4443ab91f98e17e7b7a0~mv2.jpg', NOW());

-- ============================================================
-- PRODUTOS - ACESSORIOS
-- ============================================================
INSERT IGNORE INTO produtos (id, nome, slug, descricao, descricao_curta, preco, preco_promocional, estoque, estoque_minimo, sku, categoria_id, faixa_etaria_id, genero, destaque, ativo, imagem, created_at) VALUES
(31, 'Sapatinho Trico Time', 'sapatinho-trico-time',
 'Sapatinho de tricô artesanal no estilo time. Quente e confortavel para os recem-nascidos. Feito a mao com amor.',
 'Sapatinho de tricô artesanal estilo time.',
 38.90, NULL, 20, 5, 'ACE-001', 6, 1, 'U', 0, 1,
 'https://static.wixstatic.com/media/e23129_4659ca570c404bb2b4d3831ff9dfd4b7~mv2.jpg', NOW()),

(32, 'Sapatinho Trico Bota', 'sapatinho-trico-bota',
 'Sapatinho de tricô artesanal modelo bota. Design fofo e abrigo para os pes do bebê. Qualidade artesanal garantida.',
 'Sapatinho de tricô artesanal modelo bota.',
 38.90, 27.23, 20, 5, 'ACE-002', 6, 1, 'U', 0, 1,
 'https://static.wixstatic.com/media/e23129_fb470f57949b4bf88b91dcdb8949f4fa~mv2.webp', NOW()),

(33, 'Toalha Batizado', 'toalha-batizado',
 'Toalha de banho para batizado em algodao egípcio. Macia, absorvente e com bordado personalizado. Presente perfeito.',
 'Toalha de banho para batizado em algodao.',
 59.90, NULL, 20, 5, 'ACE-003', 6, 1, 'U', 0, 1,
 'https://static.wixstatic.com/media/e23129_f9f9b768b44f4c52b4d7c5830d4ffa6b~mv2.webp', NOW());

-- ============================================================
-- PRODUTOS_IMAGENS
-- ============================================================
INSERT IGNORE INTO produtos_imagens (id, produto_id, url, alt, principal, ordem) VALUES
-- Macacao Cachorro
(1, 1, 'https://static.wixstatic.com/media/e23129_e7615472cc5d4c2b8eae2d876d360ea3~mv2.jpg', 'Macacao Cachorro - Vista Principal', 1, 1),
-- Macacao Nemo
(2, 2, 'https://static.wixstatic.com/media/e23129_b887b8b44bd743749d0eeb3740846160~mv2.png', 'Macacao Nemo - Vista Principal', 1, 1),
-- Macacao Selva
(3, 3, 'https://static.wixstatic.com/media/e23129_74b957d328f247a7b23710257ada6d72~mv2.jpg', 'Macacao Selva - Vista Principal', 1, 1),
-- Macacao Abelhas
(4, 4, 'https://static.wixstatic.com/media/e23129_2b6fe52a59b6476489ffcc8ab89f1d26~mv2.jpg', 'Macacao Abelhas - Vista Principal', 1, 1),
-- Macacao Flor
(5, 5, 'https://static.wixstatic.com/media/e23129_f79ab3a2adbf422688d67c74c5fe310e~mv2.jpg', 'Macacao Flor - Vista Principal', 1, 1),
-- Macacao Leo
(6, 6, 'https://static.wixstatic.com/media/e23129_8c17f9d8d0b84941b481ead424bd1f47~mv2.jpg', 'Macacao Leo - Vista Principal', 1, 1),
-- Macacao Transportes
(7, 7, 'https://static.wixstatic.com/media/e23129_e1c6f0fdc901424380ad3f6962da5790~mv2.jpg', 'Macacao Transportes - Vista Principal', 1, 1),
-- Macacao Cogumelo
(8, 8, 'https://static.wixstatic.com/media/e23129_de1131cc9a0f4e17a65d1167862b272f~mv2.jpg', 'Macacao Cogumelo - Vista Principal', 1, 1),
-- Bermuda Cuca
(9, 9, 'https://static.wixstatic.com/media/e23129_e3e2e9d028cd4294ab7481def8d38e67~mv2.jpg', 'Bermuda Cuca - Vista Principal', 1, 1),
-- Bermuda Bob
(10, 10, 'https://static.wixstatic.com/media/e23129_9af53e673f1645cca566a3b4da4a255a~mv2.jpg', 'Bermuda Bob - Vista Principal', 1, 1),
-- Bermuda Gamer
(11, 11, 'https://static.wixstatic.com/media/e23129_b2f0113bbe3e41d0ba70f79615ecdb34~mv2.jpg', 'Bermuda Gamer - Vista Principal', 1, 1),
-- Bermuda Kayke
(12, 12, 'https://static.wixstatic.com/media/e23129_6d6e81038be24785b5ef27bd8f75dfbd~mv2.jpg', 'Bermuda Kayke - Vista Principal', 1, 1),
-- Bermuda Tropical
(13, 13, 'https://static.wixstatic.com/media/e23129_41db3354d3834c6ab8815821e5817913~mv2.jpg', 'Bermuda Tropical - Vista Principal', 1, 1),
-- Bermuda Andes
(14, 14, 'https://static.wixstatic.com/media/e23129_97d7598849bd4c23ba1d17b34655986f~mv2.jpg', 'Bermuda Andes - Vista Principal', 1, 1),
-- Bermuda Posi
(15, 15, 'https://static.wixstatic.com/media/e23129_fb1d4642681b4470b8027ac4a0c6719f~mv2.jpg', 'Bermuda Posi - Vista Principal', 1, 1),
-- Bermuda Cena
(16, 16, 'https://static.wixstatic.com/media/e23129_1f48088945c3460a9f4c4503557899d2~mv2.jpg', 'Bermuda Cena - Vista Principal', 1, 1),
-- Blusa Friends Trip
(17, 17, 'https://static.wixstatic.com/media/e23129_c8f4906b9df04133a3121e86e1753485~mv2.png', 'Blusa Friends Trip - Vista Principal', 1, 1),
-- Blusa Princesa Vet
(18, 18, 'https://static.wixstatic.com/media/e23129_5d04da23343b4b4385e581f897b0fb0c~mv2.png', 'Blusa Princesa Vet - Vista Principal', 1, 1),
-- Blusa Senso
(19, 19, 'https://static.wixstatic.com/media/e23129_3e6d2b54963a4de490ffc5d7931e0129~mv2.png', 'Blusa Senso - Vista Principal', 1, 1),
-- Blusa Underwater
(20, 20, 'https://static.wixstatic.com/media/e23129_0528cd9294774695afd4c715b9cfac4e~mv2.png', 'Blusa Underwater - Vista Principal', 1, 1),
-- Blusa Stingray
(21, 21, 'https://static.wixstatic.com/media/e23129_59cad455a5fc43b1b158bc667d87f3cf~mv2.png', 'Blusa Stingray - Vista Principal', 1, 1),
-- Blusa Seahorse
(22, 22, 'https://static.wixstatic.com/media/e23129_af9b087ff9264380a6b608aeb49ac10d~mv2.png', 'Blusa Seahorse - Vista Principal', 1, 1),
-- Blusa Pranchas
(23, 23, 'https://static.wixstatic.com/media/e23129_76cb0ded2acf4e69827afa54885800dc~mv2.png', 'Blusa Pranchas - Vista Principal', 1, 1),
-- Blusa Water Melon
(24, 24, 'https://static.wixstatic.com/media/e23129_1b246149da584477aa707be95052ffdc~mv2.png', 'Blusa Water Melon - Vista Principal', 1, 1),
-- Biquini Liana
(25, 25, 'https://static.wixstatic.com/media/e23129_8165b0bff17049beb94aa0d3359b9bbd~mv2.png', 'Biquini Liana - Vista Principal', 1, 1),
-- Biquini Arco Iris
(26, 26, 'https://static.wixstatic.com/media/e23129_737c53255a274fe498382720f4118369~mv2.png', 'Biquini Arco Iris - Vista Principal', 1, 1),
-- Biquini UV Primavera
(27, 27, 'https://static.wixstatic.com/media/e23129_cde85af6f1ea45f88f374705bf070490~mv2.jpg', 'Biquini UV Primavera - Vista Principal', 1, 1),
-- Calca Bento
(28, 28, 'https://static.wixstatic.com/media/e23129_10c8ee98b97b48da930b65d821c3a821~mv2.png', 'Calca Bento - Vista Principal', 1, 1),
-- Calca Run
(29, 29, 'https://static.wixstatic.com/media/e23129_25091f246e5846bb983ba44c36c2bbec~mv2.png', 'Calca Run - Vista Principal', 1, 1),
-- Calca Practice
(30, 30, 'https://static.wixstatic.com/media/e23129_fdbd4bb2588f4443ab91f98e17e7b7a0~mv2.jpg', 'Calca Practice - Vista Principal', 1, 1),
-- Sapatinho Trico Time
(31, 31, 'https://static.wixstatic.com/media/e23129_4659ca570c404bb2b4d3831ff9dfd4b7~mv2.jpg', 'Sapatinho Trico Time - Vista Principal', 1, 1),
-- Sapatinho Trico Bota
(32, 32, 'https://static.wixstatic.com/media/e23129_fb470f57949b4bf88b91dcdb8949f4fa~mv2.webp', 'Sapatinho Trico Bota - Vista Principal', 1, 1),
-- Toalha Batizado
(33, 33, 'https://static.wixstatic.com/media/e23129_f9f9b768b44f4c52b4d7c5830d4ffa6b~mv2.webp', 'Toalha Batizado - Vista Principal', 1, 1);

COMMIT;

SET FOREIGN_KEY_CHECKS = 1;

-- Resumo do seed:
-- Categorias: 6 registros
-- Faixas Etarias: 4 registros
-- Produtos: 33 registros (8 macacoes + 8 bermudas + 8 blusas + 3 biquinis + 3 calcas + 3 acessorios)
-- Produtos Imagens: 33 registros (1 imagem principal por produto)
