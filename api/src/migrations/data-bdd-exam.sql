USE `bdd-exam`;

INSERT INTO `category` (`name`) VALUES
('Avions de chasse'),
('Avions de ligne'),
('Avions de tourisme'),
('Avions historiques');

INSERT INTO `supplier` (`name`, `adress`, `email`, `phone`) VALUES
('Fournisseur 1', '123 Rue des Fournisseurs', 'fournisseur1@example.com', '01-23-45-67-89'),
('Fournisseur 2', '456 Avenue des Fournisseurs', 'fournisseur2@example.com', '02-34-56-78-90'),
('Fournisseur 3', '789 Boulevard des Fournisseurs', 'fournisseur3@example.com', '03-45-67-89-01');

INSERT INTO `product` (`name`, `reference`, `price`, `stock`, `category_id`) VALUES
('Maquette F-16', 'REF001', 19.99, 100, 1),
('Maquette Boeing 747', 'REF002', 29.99, 200, 2),
('Maquette Cessna 172', 'REF003', 39.99, 150, 3),
('Maquette Spitfire', 'REF004', 49.99, 120, 4),
('Maquette Airbus A320', 'REF005', 59.99, 80, 2),
('Maquette Piper PA-28', 'REF006', 69.99, 60, 3),
('Maquette Mirage 2000', 'REF007', 79.99, 40, 1),
('Maquette Concorde', 'REF008', 89.99, 30, 2),
('Maquette B-17', 'REF009', 99.99, 20, 4),
('Maquette DC-3', 'REF010', 109.99, 10, 4),
('Maquette A380', 'REF011', 119.99, 5, 2),
('Maquette F-22', 'REF012', 129.99, 15, 1);

INSERT INTO `product_supplier` (`product_id`, `supplier_id`) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 1),
(5, 2),
(6, 3),
(7, 1),
(8, 2),
(9, 3),
(10, 1),
(11, 2),
(12, 3);

INSERT INTO `customer` (`firstname`, `lastname`, `adress`, `email`, `phone`) VALUES
('Jean', 'Dupont', '123 Rue de la Paix', 'jean.dupont@example.com', '01-23-45-67-89'),
('Marie', 'Durand', '456 Avenue de la République', 'marie.durand@example.com', '02-34-56-78-90'),
('Pierre', 'Martin', '789 Boulevard Saint-Germain', 'pierre.martin@example.com', '03-45-67-89-01'),
('Lucie', 'Bernard', '101 Rue de Rivoli', 'lucie.bernard@example.com', '04-56-78-90-12'),
('Sophie', 'Moreau', '202 Rue de Vaugirard', 'sophie.moreau@example.com', '05-67-89-01-23'),
('Thomas', 'Petit', '303 Avenue des Champs-Élysées', 'thomas.petit@example.com', '06-78-90-12-34'),
('Camille', 'Lefevre', '404 Rue de la Convention', 'camille.lefevre@example.com', '07-89-01-23-45'),
('Julien', 'Roux', '505 Rue de la Pompe', 'julien.roux@example.com', '08-90-12-34-56'),
('Claire', 'Fournier', '606 Rue de la Boétie', 'claire.fournier@example.com', '09-01-23-45-67'),
('Antoine', 'Morel', '707 Rue de la Paix', 'antoine.morel@example.com', '10-12-34-56-78');

INSERT INTO `order` (`reference`, `order_date`, `status`, `customer_id`) VALUES
('COM001', '2023-01-01 10:00:00', 'en attente', 1),
('COM002', '2023-01-02 11:00:00', 'en cours', 2),
('COM003', '2023-01-03 12:00:00', 'livré', 3),
('COM004', '2023-01-04 13:00:00', 'en attente', 4),
('COM005', '2023-01-05 14:00:00', 'en cours', 5),
('COM006', '2023-01-06 15:00:00', 'livré', 6),
('COM007', '2023-01-07 16:00:00', 'en attente', 7),
('COM008', '2023-01-08 17:00:00', 'en cours', 8),
('COM009', '2023-01-09 18:00:00', 'livré', 9),
('COM010', '2023-01-10 19:00:00', 'en attente', 10),
('COM011', '2023-01-11 20:00:00', 'en cours', 3),
('COM012', '2023-01-12 21:00:00', 'livré', 4),
('COM013', '2023-01-13 22:00:00', 'en attente', 5),
('COM014', '2023-01-14 23:00:00', 'en cours', 6),
('COM015', '2023-01-15 09:00:00', 'livré', 7),
('COM016', '2023-01-16 08:00:00', 'en attente', 8),
('COM017', '2023-01-17 07:00:00', 'en cours', 9),
('COM018', '2023-01-18 06:00:00', 'livré', 10),
('COM019', '2023-01-19 05:00:00', 'en attente', 3),
('COM020', '2023-01-20 04:00:00', 'en cours', 4),
('COM021', '2023-01-21 03:00:00', 'livré', 5),
('COM022', '2023-01-22 02:00:00', 'en attente', 6),
('COM023', '2023-01-23 01:00:00', 'en cours', 7),
('COM024', '2023-01-24 00:00:00', 'livré', 8),
('COM025', '2023-01-25 23:00:00', 'en attente', 9),
('COM026', '2023-01-26 22:00:00', 'en cours', 10);

INSERT INTO `order_line` (`quantity`, `product_id`, `order_id`) VALUES
(2, 1, 1),
(1, 2, 1),
(3, 3, 2),
(1, 4, 2),
(2, 5, 3),
(4, 6, 3),
(1, 7, 4),
(5, 8, 4),
(3, 9, 5),
(2, 10, 5),
(1, 11, 6),
(4, 12, 6),
(2, 1, 7),
(3, 2, 7),
(1, 3, 8),
(5, 4, 8),
(2, 5, 9),
(4, 6, 9),
(1, 7, 10),
(3, 8, 10),
(2, 9, 11),
(5, 10, 11),
(1, 11, 12),
(4, 12, 12),
(2, 1, 13),
(3, 2, 13),
(1, 3, 14),
(5, 4, 14),
(2, 5, 15),
(4, 6, 15),
(1, 7, 16),
(3, 8, 16),
(2, 9, 17),
(5, 10, 17),
(1, 11, 18),
(4, 12, 18),
(2, 1, 19),
(3, 2, 19),
(1, 3, 20),
(5, 4, 20),
(2, 5, 21),
(4, 6, 21),
(1, 7, 22),
(3, 8, 22),
(2, 9, 23),
(5, 10, 23),
(1, 11, 24),
(4, 12, 24),
(2, 1, 25),
(3, 2, 25),
(1, 3, 26);

-- password : Vinci#2024
INSERT INTO `user` (`lastname`, `firstname`, `email`, `password`, `role`) VALUES 
("admin", "admin", "admin@admin.fr", "$2b$10$s8WylKSR6RP5Q1aoGgGym.46fgu9lNDDY3OlGQ2dMvFoj78LJNIWK", "admin"),
("user", "user", "user@user.fr", "$2b$10$s8WylKSR6RP5Q1aoGgGym.46fgu9lNDDY3OlGQ2dMvFoj78LJNIWK", "user");