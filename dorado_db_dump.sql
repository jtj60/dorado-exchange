PGDMP     ,    )                }         	   dorado_db     15.12 (Debian 15.12-1.pgdg120+1)     15.12 (Debian 15.12-1.pgdg120+1) <    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    16384 	   dorado_db    DATABASE     t   CREATE DATABASE dorado_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';
    DROP DATABASE dorado_db;
                dorado    false                        2615    16390    exchange    SCHEMA        CREATE SCHEMA exchange;
    DROP SCHEMA exchange;
                dorado    false                        3079    16594    pgcrypto 	   EXTENSION     <   CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;
    DROP EXTENSION pgcrypto;
                   false            �           0    0    EXTENSION pgcrypto    COMMENT     <   COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';
                        false    2            �            1259    16684 
   cart_items    TABLE     �   CREATE TABLE exchange.cart_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cart_id uuid,
    product_id uuid,
    quantity integer NOT NULL
);
     DROP TABLE exchange.cart_items;
       exchange         heap    dorado    false    7            �            1259    16671    carts    TABLE     �   CREATE TABLE exchange.carts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    created_at timestamp without time zone DEFAULT now()
);
    DROP TABLE exchange.carts;
       exchange         heap    dorado    false    7            �            1259    16801    emails    TABLE     �   CREATE TABLE exchange.emails (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);
    DROP TABLE exchange.emails;
       exchange         heap    dorado    false    7            �            1259    16768    metal_sales    TABLE     �   CREATE TABLE exchange.metal_sales (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    metal_id uuid,
    weight numeric NOT NULL,
    price numeric NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);
 !   DROP TABLE exchange.metal_sales;
       exchange         heap    dorado    false    7            �            1259    16642    metals    TABLE     o   CREATE TABLE exchange.metals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    metal_type text NOT NULL
);
    DROP TABLE exchange.metals;
       exchange         heap    dorado    false    7            �            1259    16716    order_items    TABLE     �   CREATE TABLE exchange.order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid,
    product_id uuid,
    quantity integer NOT NULL
);
 !   DROP TABLE exchange.order_items;
       exchange         heap    dorado    false    7            �            1259    16700    orders    TABLE     a  CREATE TABLE exchange.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    total_price numeric NOT NULL,
    status text DEFAULT 'pending'::text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT orders_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'completed'::text, 'canceled'::text])))
);
    DROP TABLE exchange.orders;
       exchange         heap    dorado    false    7            �            1259    16732    payments    TABLE     �  CREATE TABLE exchange.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid,
    amount numeric NOT NULL,
    payment_method text NOT NULL,
    status text DEFAULT 'pending'::text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT payments_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text])))
);
    DROP TABLE exchange.payments;
       exchange         heap    dorado    false    7            �            1259    16787    pricing_history    TABLE     �   CREATE TABLE exchange.pricing_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid,
    bid_price numeric NOT NULL,
    ask_price numeric NOT NULL,
    recorded_at timestamp without time zone DEFAULT now()
);
 %   DROP TABLE exchange.pricing_history;
       exchange         heap    dorado    false    7            �            1259    16652    products    TABLE     N  CREATE TABLE exchange.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_code text NOT NULL,
    name text NOT NULL,
    metal_id uuid,
    weight numeric NOT NULL,
    bid_price numeric DEFAULT 0,
    ask_price numeric DEFAULT 0,
    availability boolean DEFAULT true NOT NULL,
    image text DEFAULT ''::text
);
    DROP TABLE exchange.products;
       exchange         heap    dorado    false    7            �            1259    16748    transactions    TABLE     P  CREATE TABLE exchange.transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    order_id uuid,
    type text NOT NULL,
    amount numeric NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT transactions_type_check CHECK ((type = ANY (ARRAY['purchase'::text, 'sale'::text])))
);
 "   DROP TABLE exchange.transactions;
       exchange         heap    dorado    false    7            �            1259    16631    users    TABLE     !  CREATE TABLE exchange.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    address text,
    phone text,
    created_at timestamp without time zone DEFAULT now()
);
    DROP TABLE exchange.users;
       exchange         heap    dorado    false    7            �          0    16684 
   cart_items 
   TABLE DATA           I   COPY exchange.cart_items (id, cart_id, product_id, quantity) FROM stdin;
    exchange          dorado    false    220   �L       �          0    16671    carts 
   TABLE DATA           :   COPY exchange.carts (id, user_id, created_at) FROM stdin;
    exchange          dorado    false    219   �L       �          0    16801    emails 
   TABLE DATA           9   COPY exchange.emails (id, email, created_at) FROM stdin;
    exchange          dorado    false    227   �L       �          0    16768    metal_sales 
   TABLE DATA           Y   COPY exchange.metal_sales (id, user_id, metal_id, weight, price, created_at) FROM stdin;
    exchange          dorado    false    225   fO       �          0    16642    metals 
   TABLE DATA           2   COPY exchange.metals (id, metal_type) FROM stdin;
    exchange          dorado    false    217   �O       �          0    16716    order_items 
   TABLE DATA           K   COPY exchange.order_items (id, order_id, product_id, quantity) FROM stdin;
    exchange          dorado    false    222   %P       �          0    16700    orders 
   TABLE DATA           P   COPY exchange.orders (id, user_id, total_price, status, created_at) FROM stdin;
    exchange          dorado    false    221   BP       �          0    16732    payments 
   TABLE DATA           ^   COPY exchange.payments (id, order_id, amount, payment_method, status, created_at) FROM stdin;
    exchange          dorado    false    223   _P       �          0    16787    pricing_history 
   TABLE DATA           ^   COPY exchange.pricing_history (id, product_id, bid_price, ask_price, recorded_at) FROM stdin;
    exchange          dorado    false    226   |P       �          0    16652    products 
   TABLE DATA           y   COPY exchange.products (id, product_code, name, metal_id, weight, bid_price, ask_price, availability, image) FROM stdin;
    exchange          dorado    false    218   �P       �          0    16748    transactions 
   TABLE DATA           Y   COPY exchange.transactions (id, user_id, order_id, type, amount, created_at) FROM stdin;
    exchange          dorado    false    224   gT       �          0    16631    users 
   TABLE DATA           n   COPY exchange.users (id, email, password_hash, first_name, last_name, address, phone, created_at) FROM stdin;
    exchange          dorado    false    216   �T       �           2606    16689    cart_items cart_items_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY exchange.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY exchange.cart_items DROP CONSTRAINT cart_items_pkey;
       exchange            dorado    false    220            �           2606    16677    carts carts_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY exchange.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY exchange.carts DROP CONSTRAINT carts_pkey;
       exchange            dorado    false    219            
           2606    16811    emails emails_email_key 
   CONSTRAINT     U   ALTER TABLE ONLY exchange.emails
    ADD CONSTRAINT emails_email_key UNIQUE (email);
 C   ALTER TABLE ONLY exchange.emails DROP CONSTRAINT emails_email_key;
       exchange            dorado    false    227                       2606    16809    emails emails_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY exchange.emails
    ADD CONSTRAINT emails_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY exchange.emails DROP CONSTRAINT emails_pkey;
       exchange            dorado    false    227                       2606    16776    metal_sales metal_sales_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY exchange.metal_sales
    ADD CONSTRAINT metal_sales_pkey PRIMARY KEY (id);
 H   ALTER TABLE ONLY exchange.metal_sales DROP CONSTRAINT metal_sales_pkey;
       exchange            dorado    false    225            �           2606    16651    metals metals_metal_type_key 
   CONSTRAINT     _   ALTER TABLE ONLY exchange.metals
    ADD CONSTRAINT metals_metal_type_key UNIQUE (metal_type);
 H   ALTER TABLE ONLY exchange.metals DROP CONSTRAINT metals_metal_type_key;
       exchange            dorado    false    217            �           2606    16649    metals metals_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY exchange.metals
    ADD CONSTRAINT metals_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY exchange.metals DROP CONSTRAINT metals_pkey;
       exchange            dorado    false    217                        2606    16721    order_items order_items_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY exchange.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);
 H   ALTER TABLE ONLY exchange.order_items DROP CONSTRAINT order_items_pkey;
       exchange            dorado    false    222            �           2606    16710    orders orders_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY exchange.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY exchange.orders DROP CONSTRAINT orders_pkey;
       exchange            dorado    false    221                       2606    16742    payments payments_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY exchange.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY exchange.payments DROP CONSTRAINT payments_pkey;
       exchange            dorado    false    223                       2606    16795 $   pricing_history pricing_history_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY exchange.pricing_history
    ADD CONSTRAINT pricing_history_pkey PRIMARY KEY (id);
 P   ALTER TABLE ONLY exchange.pricing_history DROP CONSTRAINT pricing_history_pkey;
       exchange            dorado    false    226            �           2606    16663    products products_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY exchange.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY exchange.products DROP CONSTRAINT products_pkey;
       exchange            dorado    false    218            �           2606    16665 "   products products_product_code_key 
   CONSTRAINT     g   ALTER TABLE ONLY exchange.products
    ADD CONSTRAINT products_product_code_key UNIQUE (product_code);
 N   ALTER TABLE ONLY exchange.products DROP CONSTRAINT products_product_code_key;
       exchange            dorado    false    218                       2606    16757    transactions transactions_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY exchange.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY exchange.transactions DROP CONSTRAINT transactions_pkey;
       exchange            dorado    false    224            �           2606    16641    users users_email_key 
   CONSTRAINT     S   ALTER TABLE ONLY exchange.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
 A   ALTER TABLE ONLY exchange.users DROP CONSTRAINT users_email_key;
       exchange            dorado    false    216            �           2606    16639    users users_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY exchange.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY exchange.users DROP CONSTRAINT users_pkey;
       exchange            dorado    false    216                       2606    16690 "   cart_items cart_items_cart_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY exchange.cart_items
    ADD CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES exchange.carts(id) ON DELETE CASCADE;
 N   ALTER TABLE ONLY exchange.cart_items DROP CONSTRAINT cart_items_cart_id_fkey;
       exchange          dorado    false    219    3322    220                       2606    16695 %   cart_items cart_items_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY exchange.cart_items
    ADD CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES exchange.products(id) ON DELETE CASCADE;
 Q   ALTER TABLE ONLY exchange.cart_items DROP CONSTRAINT cart_items_product_id_fkey;
       exchange          dorado    false    220    218    3318                       2606    16678    carts carts_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY exchange.carts
    ADD CONSTRAINT carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES exchange.users(id) ON DELETE CASCADE;
 D   ALTER TABLE ONLY exchange.carts DROP CONSTRAINT carts_user_id_fkey;
       exchange          dorado    false    3312    219    216                       2606    16782 %   metal_sales metal_sales_metal_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY exchange.metal_sales
    ADD CONSTRAINT metal_sales_metal_id_fkey FOREIGN KEY (metal_id) REFERENCES exchange.metals(id) ON DELETE SET NULL;
 Q   ALTER TABLE ONLY exchange.metal_sales DROP CONSTRAINT metal_sales_metal_id_fkey;
       exchange          dorado    false    3316    217    225                       2606    16777 $   metal_sales metal_sales_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY exchange.metal_sales
    ADD CONSTRAINT metal_sales_user_id_fkey FOREIGN KEY (user_id) REFERENCES exchange.users(id) ON DELETE CASCADE;
 P   ALTER TABLE ONLY exchange.metal_sales DROP CONSTRAINT metal_sales_user_id_fkey;
       exchange          dorado    false    225    216    3312                       2606    16722 %   order_items order_items_order_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY exchange.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES exchange.orders(id) ON DELETE CASCADE;
 Q   ALTER TABLE ONLY exchange.order_items DROP CONSTRAINT order_items_order_id_fkey;
       exchange          dorado    false    221    222    3326                       2606    16727 '   order_items order_items_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY exchange.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES exchange.products(id) ON DELETE CASCADE;
 S   ALTER TABLE ONLY exchange.order_items DROP CONSTRAINT order_items_product_id_fkey;
       exchange          dorado    false    218    3318    222                       2606    16711    orders orders_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY exchange.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES exchange.users(id) ON DELETE CASCADE;
 F   ALTER TABLE ONLY exchange.orders DROP CONSTRAINT orders_user_id_fkey;
       exchange          dorado    false    216    3312    221                       2606    16743    payments payments_order_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY exchange.payments
    ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES exchange.orders(id) ON DELETE CASCADE;
 K   ALTER TABLE ONLY exchange.payments DROP CONSTRAINT payments_order_id_fkey;
       exchange          dorado    false    3326    221    223                       2606    16796 /   pricing_history pricing_history_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY exchange.pricing_history
    ADD CONSTRAINT pricing_history_product_id_fkey FOREIGN KEY (product_id) REFERENCES exchange.products(id) ON DELETE CASCADE;
 [   ALTER TABLE ONLY exchange.pricing_history DROP CONSTRAINT pricing_history_product_id_fkey;
       exchange          dorado    false    3318    218    226                       2606    16666    products products_metal_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY exchange.products
    ADD CONSTRAINT products_metal_id_fkey FOREIGN KEY (metal_id) REFERENCES exchange.metals(id) ON DELETE SET NULL;
 K   ALTER TABLE ONLY exchange.products DROP CONSTRAINT products_metal_id_fkey;
       exchange          dorado    false    217    3316    218                       2606    16763 '   transactions transactions_order_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY exchange.transactions
    ADD CONSTRAINT transactions_order_id_fkey FOREIGN KEY (order_id) REFERENCES exchange.orders(id) ON DELETE SET NULL;
 S   ALTER TABLE ONLY exchange.transactions DROP CONSTRAINT transactions_order_id_fkey;
       exchange          dorado    false    221    3326    224                       2606    16758 &   transactions transactions_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY exchange.transactions
    ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES exchange.users(id) ON DELETE CASCADE;
 R   ALTER TABLE ONLY exchange.transactions DROP CONSTRAINT transactions_user_id_fkey;
       exchange          dorado    false    3312    224    216            �      x������ � �      �      x������ � �      �   h  x�m�I��F�תS��8S�$�TF�����N� �� A@}|�{Evb�a�``�]��Bs1�:����-����__���ہ*�'�K��x��Dt�J0t`�7�b�0�Y�\�_��ȸ�On�&���f��xt�.�`����\��;�.��Y�"�Զ��m���G�:{�[Cx��/P�X����Q��\�lX$t'O��3!����O����V�D��
uk�j��Kw�Ԥ6��У���y�zJ�qq����������rjwks�?�����cq��2:�	�U!�OSy�����_a���Tt��.�L%p
-0Y���z8��]ֶ���o�w���ܢ��&��=�F�a����[f����; ]M�j�Ҋ����̫ pmb� ��۴���'����sy�a	��-T�47ڀx|M�I������g�^�'���n��&�$�X�lhD��-�����v>"�nv� �w���龬ؘNt>~=�jtF^-�C������6j��jٛ7��\���4>=Hԋ!�����N˂�5F��'�ǿ��D�p�T/��0#����3��m��V���|����tr���y�R�ڤ;A      �      x������ � �      �   �   x��A��0@�u|��ƀ�2����D����_�Ks+�0�j�3�P#��ھI���SE�8��V.�X�p rp#��:�'���hݚCw���R�RMG�!G�l�5���}?�z�=@C@eű��>�����K�T?W�sK)}��2      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �   �  x���OOk7���S�%]�{l/
)�/�������H�]���O߹/@�SK�M����9c�"yk�l�lAF_k�ʧZ'�s��~<�}2߬K7���*sߝ���v��l��W�iƃ��j�!�#h���p�N�D�o;9⦭wJ���[
Ė jW��1:'\�������lj�HNd2`�Z�34��r�Ʊ�~O�V���z!�B����u� 5/t	�r��J�i2��zq�/��Sk���G�/Ȣ�AO�r�i-ȔC�*�R������v�y��uӶ#^O�u�/B��ڨ!Pc��
9�F��3�X��<�/������q;����[��x����|��DV�R�Jk2N
!V����T��i2������#��[6�����$7N*jp؀Xy�L%�ؘ�����?==�ˈ^���ӧʭ���+SÈ���S`s���7���b���I#wt�;���H6���6���'Hjd�b|��LT#{t�{��k�'I,���1����-E��r�������N5z�l��
�VY�m�e/&���eǞ�-���m��D: �u�)�Ь���g����g�Rl��"�xf�dd�7�0���[B'�?��2}6댇��u���:�/!��X	IY��CK�E��`�g��v��N�i��TU�JFg��� ��dcM �#xC��a�Z�z9],/��/�����ۧ��:K!'Yu蔴��B2)B�1�%ʲ�fWo���j����;^ԭ��p�X}�;�М�W��PC
���V�QZ ��rt���.������7��F�c��wЮ���5�ש��bW�Χ�L�YRDi�D��zz�L���Oo�6�뜂��%�eje�(����M�Ƙ����oN-w�E��m�9�-�����(�_�1Լ��VF�fyXTyNX�2��s����8Բ�/���(�k:y�o��89::��Z�{      �      x������ � �      �      x������ � �     